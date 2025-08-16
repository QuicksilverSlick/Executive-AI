// Absolute minimal endpoint
export default (req, res) => {
  res.json({ ok: true, time: Date.now() });
};