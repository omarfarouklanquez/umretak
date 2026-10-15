// Curated free-license photography (Unsplash License — free for commercial use, no
// attribution required; hotlinked from the Unsplash CDN per their guidelines).
// Swap `src()` for your own CDN/asset store later; components fall back to brand art offline.
export const src = (id, w = 800) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`

export const PH = {
  makkah: ['1627728734379-a5f8c099763e', '1713239060784-e6ed820a0715', '1782798559017-7196f6aa26a3', '1580418827493-f2b22c0a76cb', '1592326871020-04f58c1a52f3', '1770786106021-52580470e31e', '1513072064285-240f87fa81e8', '1758985776354-4df674930917', '1693590614566-1d3ea9ef32f7', '1771170983433-1576bc4a7eec', '1691566264354-88491ba17f15', '1633546707050-88e2b545831c', '1720549973451-018d3623b55a', '1780265861345-a787b955b505', '1605553378313-22d0dc541393', '1786217483243-2e2e74d79cb3'],
  madinah: ['1646424857576-2a66db82a65c', '1724191078796-8a997b989f43', '1711261817080-8f064416206c', '1692566123227-0f68f1b9dac6', '1729931421786-7bbd6c7d78f6', '1638972737817-b35a7fd90b3c', '1739029995207-c633ff65afcc', '1771171123597-cf49343f6d11', '1768054582993-d60392cab0d9', '1735405227280-7dc724d9e962', '1788449220318-abccfc4e4df9', '1692977579997-948328cdb7d2'],
  tower: ['1751040138995-7c566e92744c', '1659255068757-259124c6d867', '1727540419428-7ace2a2a4915', '1771170975771-0c14516310b1', '1778567090655-5a2cdc37eab9', '1693217683336-517b249e3541'],
  room: ['1618773928121-c32242e63f39', '1771775529138-a7a20ba7e032', '1611892440504-42a792e24d32', '1578683010236-d716f9a3f461', '1759363895956-00e009b608ed', '1776763018972-588e27bf6511', '1629140727571-9b5c6f6267b4', '1777169794972-12095816073b', '1564078516393-cf04bd966897'],
  lobby: ['1621293954908-907159247fc8', '1625244724120-1fd1d34d00f6', '1774045403550-0245fc4e1c85', '1660557989695-14fac79c086d', '1573052905904-34ad8c27f0cc'],
  dining: ['1776993298437-fab447702a31', '1785845506893-70768a28ba44', '1414235077428-338989a2e8c0', '1552566626-52f8b828add9'],
  pool: ['1566073771259-6a8506099945', '1571896349842-33c89424de2d', '1780323800239-ce570fdc1b9c'],
  train: ['1774474502890-2679371919d0', '1779776147369-2a8d1751150f', '1523667071851-4fda8c8a8dd5', '1713918308760-5c9a02a8ca46', '1777063893909-875f68ca16d6'],
  plane: ['1436491865332-7a61a109cc05', '1775026481134-f980d6517ee2', '1543797414-a0c3ad076f7c', '1545132147-d037e6c54cfd', '1517999349371-c43520457b23'],
  mosque: ['1600814832809-579119f47045', '1758696642916-7aba128db6bf', '1627790497727-41fb43f961be', '1772689277422-0a532c5ee1c8', '1774688594088-ec8fd6768c6a', '1776236035171-65a00b623fb7'],
  dates: ['1771231591559-d19c89ad118a', '1629738601425-494c3d6ba3e2', '1773038831316-a2f5e52a56e4', '1642073537056-20608544f111'],
  tasbih: ['1771758266506-c7002e6487af', '1762013728442-c6cdde57371e', '1682761794593-9687dcfd1d1c', '1720873160840-d5934323bb23'],
  quran: ['1786894674594-a5d637349573', '1542816417-0983c9c9ad53', '1786166713922-4b99085f0723', '1587617425953-9075d28b8c46', '1609599006353-e629aaabfeae'],
  mat: ['1761958150507-7bcc80840cf9', '1761699890197-46dda22b17b4', '1600814832809-579119f47045'],
  perfume: ['1636503461005-4f7dd6081d27', '1640869116016-93c00ba94b28', '1700665053090-e64274eeba84'],
  pattern: ['1783590876527-6e66d0035c7e', '1775259608507-2ae6837c251a', '1558114965-eeb97aa84c3b'],
  jeddah: ['1781762258140-fae77c26ae5b', '1674979724572-c0a0579bc9d0', '1586715065342-98d1f6016fd1', '1699954669485-812988f5c2db'],
  car: ['1776635742070-b90c433d47be', '1767749995450-7b63ab7cd4fd', '1757839724415-e0f8c952264b', '1735620731955-b047a7122892'],
  bus: ['1570125909232-eb263c188f7e', '1544620347-c4fd4a3d5957', '1759473434576-bcf2b4c01916'],
  passport: ['1581553673739-c4906b5d0de8', '1553697388-94e804e2f0f6', '1454496406107-dc34337da8d6', '1787030186312-ee07d04114f6'],
  desert: ['1609151712779-4f86b3de7308', '1551031749-9257c3aee0df', '1645891697649-6548872ce502', '1682687220499-d9c06b872eee'],
  lantern: ['1772805498407-69163cc34bc9', '1784065800085-d39e3c3318f5', '1596093019686-550d740a2870'],
  bag: ['1509762774605-f07235a08f1f', '1622560480605-d83c853bc5c3'],
}
const n = (id) => parseInt(String(id).replace(/\D/g, ''), 10) || 0
const pick = (set, i) => 'photo-' + PH[set][i % PH[set].length]
export const photo = (set, i = 0, w) => src(pick(set, i), w)

export const pkgPhoto = (p, w) => (p.kind === 'hajj' ? photo('makkah', n(p.id) + 5, w) : p.makkahFirst ? photo('makkah', n(p.id), w) : photo('madinah', n(p.id), w))
export const hotelPhotos = (h, w) => {
  const i = n(h.id)
  return [photo(h.city === 'makkah' ? (i % 2 ? 'tower' : 'makkah') : 'madinah', i, w), photo('room', i, w), photo('lobby', i, w), photo('dining', i, w), photo(h.stars === 5 ? 'pool' : 'room', i + 3, w)]
}
export const hotelPhoto = (h, w) => photo('room', n(h.id), w)
export const vehiclePhoto = (v, w) => photo(['sedan', 'vip', 'van'].includes(v.cls) ? 'car' : 'bus', n(v.id), w)
export const visaPhoto = (v, w) => photo('passport', n(v.id), w)
export const tourPhoto = (t, w) => photo(t.city === 'makkah' ? (n(t.id) % 2 ? 'desert' : 'makkah') : 'madinah', n(t.id) + 2, w)
const CAT_SET = { ihram: 'makkah', zamzam: 'dates', worship: 'tasbih', perfume: 'perfume', gifts: 'lantern', travel: 'bag', care: 'mat', tech: 'plane' }
export const productPhoto = (p, w) => {
  if (p.name.includes('مصحف')) return photo('quran', n(p.id), w)
  if (p.name.includes('سجادة')) return photo('mat', n(p.id), w)
  if (p.name.includes('الكعبة')) return photo('tower', n(p.id), w)
  return photo(CAT_SET[p.cat] || 'pattern', n(p.id) + (p.cat === 'ihram' ? 11 : 0), w)
}
export const postPhoto = (p, w) => photo(['makkah', 'madinah', 'mosque', 'train', 'quran', 'room', 'makkah', 'bag'][n(p.id) % 8], n(p.id) + 4, w)
