from __future__ import annotations

import hashlib

from django.conf import settings
from django.core.cache import cache
from django.core.paginator import Paginator
from django.utils.functional import cached_property


def _build_queryset_count_cache_key(queryset) -> str | None:
    query = getattr(queryset, 'query', None)
    model = getattr(queryset, 'model', None)
    if query is None or model is None:
        return None

    try:
        sql, params = query.sql_with_params()
    except Exception:
        return None

    raw_key = f'{queryset.db}|{model._meta.label_lower}|{sql}|{params!r}'
    digest = hashlib.sha256(raw_key.encode('utf-8')).hexdigest()
    return f'pagination-count:{digest}'


class CachedCountPaginator(Paginator):
    @cached_property
    def count(self):
        cache_key = _build_queryset_count_cache_key(self.object_list)
        if not cache_key:
            return self._compute_count()

        cached_count = cache.get(cache_key)
        if cached_count is not None:
            return cached_count

        count = self._compute_count()
        cache.set(cache_key, count, timeout=settings.PAGINATION_COUNT_CACHE_TIMEOUT)
        return count

    def _compute_count(self) -> int:
        object_list = self.object_list
        if hasattr(object_list, 'count') and hasattr(object_list, 'query'):
            return object_list.count()
        return len(object_list)
