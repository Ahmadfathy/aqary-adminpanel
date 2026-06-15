export function unwrapList(response: any, keys: string[] = []) {
  let data = response?.data?.data?.data || response?.data?.data || response?.data || []
  if (!Array.isArray(data)) {
    for (const key of keys) {
      if (Array.isArray(data?.[key])) return data[key]
    }
    data = data?.items || data?.data || []
  }
  return Array.isArray(data) ? data : []
}

export function unwrapItem(response: any, keys: string[] = []) {
  const data = response?.data?.data?.data || response?.data?.data || response?.data || {}
  for (const key of keys) {
    if (data?.[key]) return data[key]
  }
  return data || {}
}

export function errorMessages(err: any, fallback = 'حدث خطأ، يرجى المحاولة مرة أخرى') {
  const data = err?.response?.data
  if (data?.errors) {
    const list = Object.values(data.errors).flat() as string[]
    if (list.length) return list
  }
  return [data?.message || fallback]
}

export function isActive(value: any) {
  return value === true || value === 1 || value === '1' || value === 'active'
}

export function entityName(item: any) {
  return item?.name_ar || item?.title_ar || item?.name || item?.title || item?.name_en || item?.title_en || '—'
}

export function cleanParams(params: Record<string, any>) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value !== undefined && value !== null))
}
