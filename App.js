// app.js - Logic loc / tim / sap xep / tu co chu
// Du lieu: window.DATA tu data.js
var sortKey = 'gia';
var sortDir = 'desc';
function norm(s) {
  return String(s || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}
function fuzzy(query, text) {
  var q = norm(query), t = norm(text);
  if (!q) return true;
  var parts = q.split(' ');
  for (var i = 0; i < parts.length; i++) { if (t.indexOf(parts[i]) < 0) return false; }
  return true;
}
function getFilteredList() {
  var DATA = window.DATA || [];
  var q = document.getElementById('q').value.trim();
  var qLoai = document.getElementById('qLoai').value.trim();
  var fLoai = document.getElementById('fLoai').value;
  var fKT = document.getElementById('fKT').value;
  var list = DATA.filter(function (r) {
    if (fLoai && r[0] !== fLoai) return false;
    if (fKT && r[1] !== fKT) return false;
    if (qLoai && !fuzzy(qLoai, r[0])) return false;
    if (q && !(fuzzy(q, r[3]) || fuzzy(q, r[4]) || fuzzy(q, r[2]) || fuzzy(q, r[1]) || fuzzy(q, r[0]))) return false;
    return true;
  });
  var order = { Film: 0, Red: 1, 'Thường': 2 };
  list.sort(function (a, b) {
    var cmp = 0;
    if (sortKey === 'loai') cmp = order[a[0]] - order[b[0]];
    else if (sortKey === 'kt') {
      var ma = String(a[1]).match(/(\d+)mm x (\d+)x(\d+)/);
      var mb = String(b[1]).match(/(\d+)mm x (\d+)x(\d+)/);
      var va = ma ? [+ma[1], +ma[2] * +ma[3]] : [0, 0];
      var vb = mb ? [+mb[1], +mb[2] * +mb[3]] : [0, 0];
      cmp = (va[0] - vb[0]) || (va[1] - vb[1]);
    } else cmp = parseFloat(a[5]) - parseFloat(b[5]);
    return sortDir === 'desc' ? -cmp : cmp;
  });
  return list;
}
function render() {
  var list = getFilteredList();
  document.getElementById('count').textContent = list.length;
  var tbody = document.getElementById('tbody');
  tbody.innerHTML = '';
  for (var i = 0; i < list.length; i++) {
    var r = list[i];
    var tr = document.createElement('tr');
    if (r[0] === 'Film') tr.className = 'film';
    else if (r[0] === 'Red') tr.className = 'red';
    tr.addEventListener('click', function () { this.classList.toggle('expanded'); });
    for (var c = 0; c < 9; c++) {
      var td = document.createElement('td');
      if (c === 2 || c === 3 || c === 4) td.className = 'left';
      if (c === 5) { var b = document.createElement('b'); b.textContent = r[c]; td.appendChild(b); }
      else td.textContent = r[c];
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  autoFont();
}
function autoFont() {
  var cells = document.querySelectorAll('#tbody tr:not(.expanded) td');
  for (var i = 0; i < cells.length; i++) {
    var cell = cells[i]; cell.style.fontSize = '10px';
    var size = 10, tries = 0;
    while (cell.scrollWidth > cell.clientWidth + 2 && size > 7 && tries < 10) { size -= 0.5; cell.style.fontSize = size + 'px'; tries++; }
  }
}
function setSort(key) {
  if (sortKey === key) sortDir = sortDir === 'desc' ? 'asc' : 'desc';
  else { sortKey = key; sortDir = (key === 'gia' ? 'desc' : 'asc'); }
  document.getElementById('aLoai').textContent = sortKey === 'loai' ? (sortDir === 'desc' ? '▼' : '▲') : '↕';
  document.getElementById('aKT').textContent = sortKey === 'kt' ? (sortDir === 'desc' ? '▼' : '▲') : '↕';
  document.getElementById('aGia').textContent = sortKey === 'gia' ? (sortDir === 'desc' ? '▼' : '▲') : '↕';
  render();
}
function buildKTOptions() {
  var DATA = window.DATA || []; var seen = {};
  for (var i = 0; i < DATA.length; i++) { if (DATA[i][1]) seen[DATA[i][1]] = 1; }
  var sel = document.getElementById('fKT');
  Object.keys(seen).sort().forEach(function (k) { var o = document.createElement('option'); o.value = k; o.textContent = k; sel.appendChild(o); });
}
document.getElementById('thLoai').addEventListener('click', function () { setSort('loai'); });
document.getElementById('thKT').addEventListener('click', function () { setSort('kt'); });
document.getElementById('thGia').addEventListener('click', function () { setSort('gia'); });
document.getElementById('q').addEventListener('input', render);
document.getElementById('qLoai').addEventListener('input', render);
document.getElementById('fLoai').addEventListener('change', render);
document.getElementById('fKT').addEventListener('change', render);
document.getElementById('btnAuto').addEventListener('click', render);
if (!window.DATA) {
  document.getElementById('tbody').innerHTML = '<tr><td colspan="9">Chưa load được data.js - Kiểm tra đã upload đủ 4 file cùng thư mục chưa</td></tr>';
} else { buildKTOptions(); render(); }
