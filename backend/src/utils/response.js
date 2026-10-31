export const ok = (res, data = null, message = 'Operation completed successfully.', meta) =>
  res.status(200).json({ success: true, message, data, ...(meta ? { meta } : {}) })

export const created = (res, data = null, message = 'Created successfully.') =>
  res.status(201).json({ success: true, message, data })
