from rest_framework import serializers
from .models import H1BApplication, LotteryYear, CountryCapStatus

ACRONYMS = {
    "LLC", "INC", "LTD", "LLP", "CORP", "PLC", "LP", "PC", "DBA", "L.C.",
    "USA", "US", "U.S.", "L.L.C.", "L.L.P.", "NA", "SA", "NV",
    "AG", "GMBH", "CO", "&", "II", "III", "IV", "V", "P.A.", "L.C.",
}
STATE_ABBREV = {
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
    "DC", "PR", "GU", "VI",
}


def normalize_company_name(name):
    """Turn 'GOOGLE LLC' into 'Google LLC'. Preserves known acronyms."""
    if not name:
        return ""
    words = name.strip().split()
    result = []
    for w in words:
        upper = w.upper().strip(".,")
        if upper in ACRONYMS:
            result.append(upper)
        else:
            titled = w.title()
            # Fix .Com → .com, .Net → .net etc
            for tld in (".Com", ".Net", ".Org", ".Io", ".Ai", ".Co"):
                if titled.endswith(tld):
                    titled = titled[: -len(tld)] + tld.lower()
                    break
            result.append(titled)
    return " ".join(result)


def normalize_city(city):
    """Turn 'NEW YORK' into 'New York', 'st. louis' into 'St. Louis'."""
    if not city:
        return ""
    return city.strip().title()


def normalize_state(state):
    """Turn 'ca' into 'CA'."""
    if not state:
        return ""
    state = state.strip().upper()
    return state if state in STATE_ABBREV else state


def normalize_status(status):
    """Normalize any status variant to a clean label."""
    cleaned = (status or "").strip().lower()
    cleaned = cleaned.replace("-", " ").replace("_", " ")
    cleaned = " ".join(cleaned.split())
    if "certified" in cleaned and "withdrawn" in cleaned:
        return "Certified (Withdrawn)"
    if "certified" in cleaned:
        return "Certified"
    if "denied" in cleaned:
        return "Denied"
    if "withdrawn" in cleaned:
        return "Withdrawn"
    return status or ""


class H1BApplicationSerializer(serializers.ModelSerializer):
    employer_name = serializers.SerializerMethodField()
    employer_city = serializers.SerializerMethodField()
    employer_state = serializers.SerializerMethodField()
    case_status = serializers.SerializerMethodField()

    def get_employer_name(self, obj):
        return normalize_company_name(obj.employer_name)

    def get_employer_city(self, obj):
        return normalize_city(obj.employer_city)

    def get_employer_state(self, obj):
        return normalize_state(obj.employer_state)

    def get_case_status(self, obj):
        return normalize_status(obj.case_status)

    class Meta:
        model = H1BApplication
        fields = ['id', 'case_number', 'case_status', 'received_date', 'decision_date',
                  'employer_name', 'employer_city', 'employer_state', 'job_title',
                  'soc_code', 'soc_title', 'wage_rate_of_pay_from', 'wage_rate_of_pay_to',
                  'wage_unit_of_pay', 'prevailing_wage', 'visa_class', 'full_time_position',
                  'fiscal_year']


class LotteryYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = LotteryYear
        fields = ['id', 'fiscal_year', 'total_registrations', 'selected_registrations',
                  'regular_cap_registrations', 'regular_cap_selected', 'masters_cap_registrations',
                  'masters_cap_selected', 'overall_selection_rate', 'regular_cap_selection_rate',
                  'masters_cap_selection_rate', 'country_stats']


class CountryCapStatusSerializer(serializers.ModelSerializer):
    approval_rate = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = CountryCapStatus
        fields = ['id', 'country', 'fiscal_year', 'total_applications', 'approved',
                  'denied', 'pending', 'approval_rate', 'priority_date_current',
                  'priority_date_notes']
