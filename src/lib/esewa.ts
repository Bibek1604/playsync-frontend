export interface EsewaPaymentPayload {
  paymentUrl: string;
  params: Record<string, string | number | null | undefined>;
}

interface EsewaSubmitResult {
  ok: boolean;
  error?: string;
}

const BASE_SIGNATURE_FIELDS = ['total_amount', 'transaction_uuid', 'product_code'] as const;

function normalizeParams(params: Record<string, string | number | null | undefined>): Record<string, string> {
  const normalized: Record<string, string> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    normalized[key] = String(value);
  });

  return normalized;
}

function getMissingSignedFields(params: Record<string, string>): string[] {
  const signedFieldsRaw = params.signed_field_names || '';
  const signedFields = signedFieldsRaw
    .split(',')
    .map((field) => field.trim())
    .filter(Boolean);

  return signedFields.filter((field) => !params[field]);
}

function normalizeSignedFieldNames(value: string): string {
  return value
    .split(',')
    .map((field) => field.trim())
    .filter(Boolean)
    .join(',');
}

function ensureRequiredFormFields(params: Record<string, string>): void {
  if (!params.total_amount && params.amount) {
    params.total_amount = params.amount;
  }

  if (!params.amount && params.total_amount) {
    params.amount = params.total_amount;
  }

  if (!params.tax_amount) {
    params.tax_amount = '0';
  }

  if (!params.product_service_charge) {
    params.product_service_charge = '0';
  }

  if (!params.product_delivery_charge) {
    params.product_delivery_charge = '0';
  }
}

function shouldFallbackToBaseSignatureFields(params: Record<string, string>): boolean {
  const hasBaseValues = BASE_SIGNATURE_FIELDS.every((field) => Boolean(params[field]));
  if (!hasBaseValues || !params.signature || !params.signed_field_names) {
    return false;
  }

  const fields = normalizeSignedFieldNames(params.signed_field_names)
    .split(',')
    .filter(Boolean);
  const baseSet = new Set(BASE_SIGNATURE_FIELDS);
  const hasExtendedField = fields.some((field) => !baseSet.has(field as (typeof BASE_SIGNATURE_FIELDS)[number]));

  return hasExtendedField;
}

export function submitEsewaPaymentForm(payload: EsewaPaymentPayload): EsewaSubmitResult {
  if (!payload.paymentUrl) {
    return { ok: false, error: 'Missing eSewa payment URL.' };
  }

  const params = normalizeParams(payload.params || {});
  ensureRequiredFormFields(params);

  if (params.signed_field_names) {
    params.signed_field_names = normalizeSignedFieldNames(params.signed_field_names);
  }

  // Compatibility fallback: some legacy APIs return signature for base 3 fields only.
  if (shouldFallbackToBaseSignatureFields(params)) {
    params.signed_field_names = BASE_SIGNATURE_FIELDS.join(',');
  }

  if (!params.signature) {
    return { ok: false, error: 'Missing eSewa signature.' };
  }

  if (!params.signed_field_names) {
    return { ok: false, error: 'Missing eSewa signed_field_names.' };
  }

  const missingSignedFields = getMissingSignedFields(params);
  if (missingSignedFields.length > 0) {
    return {
      ok: false,
      error: `Missing signed fields: ${missingSignedFields.join(', ')}`,
    };
  }

  const form = document.createElement('form');
  form.setAttribute('method', 'POST');
  form.setAttribute('action', payload.paymentUrl);

  Object.entries(params).forEach(([key, value]) => {
    const hiddenField = document.createElement('input');
    hiddenField.setAttribute('type', 'hidden');
    hiddenField.setAttribute('name', key);
    hiddenField.setAttribute('value', value);
    form.appendChild(hiddenField);
  });

  document.body.appendChild(form);
  form.submit();

  return { ok: true };
}
