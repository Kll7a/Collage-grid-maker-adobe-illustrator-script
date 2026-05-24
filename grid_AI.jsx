var doc = app.activeDocument;
var sel = doc.selection;

if (sel.length === 0) {
    alert("Ошибка: Выделите объекты для распределения.");
} else {
    fillAreaWithClipping(sel);
}

function fillAreaWithClipping(sel) {
    // 1. Запрос параметров
    var inputWStr = prompt("Введите общую ширину (в см):", "55");
    if (inputWStr === null) return;
    var inputW = Number(inputWStr.replace(',', '.'));

    var inputHStr = prompt("Введите общую высоту (в см):", "75");
    if (inputHStr === null) return;
    var inputH = Number(inputHStr.replace(',', '.'));

    var inputPStr = prompt("Введите отступ между фото (в см):", "1");
    if (inputPStr === null) return;
    var inputP = Number(inputPStr.replace(',', '.'));

    if (isNaN(inputW) || isNaN(inputH) || isNaN(inputP) || inputW <= 0 || inputH <= 0) {
        alert("Ошибка: Введены некорректные значения.");
        return;
    }

    // Исключение объектов с нулевыми размерами
    var items = [];
    for (var i = 0; i < sel.length; i++) {
        if (sel[i].width > 0 && sel[i].height > 0) {
            items.push(sel[i]);
        }
    }
    
    var n = items.length;
    if (n === 0) return;

    var ptsPerCm = 28.3464567;
    var targetW = inputW * ptsPerCm;
    var targetH = inputH * ptsPerCm;
    var padding = inputP * ptsPerCm;

    // 2. Генерация сетки блоков (Рекурсивное разбиение)
    var cells = [];
    function subdivide(x, y, w, h, count) {
        if (count === 1) {
            cells.push({x: x, y: y, w: w, h: h});
            return;
        }

        var count1 = Math.floor(count / 2);
        var count2 = count - count1;
        var ratio = count1 / count;

        if (w > h) {
            // Деление по вертикали (на левую и правую части)
            var w1 = (w - padding) * ratio;
            var w2 = w - padding - w1;
            subdivide(x, y, w1, h, count1);
            subdivide(x + w1 + padding, y, w2, h, count2);
        } else {
            // Деление по горизонтали (на верхнюю и нижнюю части)
            var h1 = (h - padding) * ratio;
            var h2 = h - padding - h1;
            subdivide(x, y, w, h1, count1);
            subdivide(x, y - h1 - padding, w, h2, count2);
        }
    }

    subdivide(0, 0, targetW, targetH, n);

    // 3. Сортировка блоков и фотографий для минимизации кадрирования
    cells.sort(function(a, b) { return (a.w / a.h) - (b.w / b.h); });
    
    var imgData = [];
    for (var k = 0; k < n; k++) {
        imgData.push({
            item: items[k],
            ratio: items[k].width / items[k].height
        });
    }
    imgData.sort(function(a, b) { return a.ratio - b.ratio; });

    // 4. Размещение, масштабирование и создание масок
    var finalGroups = [];
    for (var j = 0; j < n; j++) {
        var cell = cells[j];
        var item = imgData[j].item;

        // Вычисление масштаба для полного перекрытия блока (аналог object-fit: cover)
        var scale = Math.max(cell.w / item.width, cell.h / item.height);
        var scalePct = scale * 100;
        
        if (isFinite(scalePct)) {
            item.resize(scalePct, scalePct, true, true, true, true, scalePct);
        }

        // Центрирование фотографии внутри своего блока
        item.left = cell.x + (cell.w - item.width) / 2;
        item.top = cell.y - (cell.h - item.height) / 2;

        // Создание группы и обтравочной маски
        var clipGroup = doc.groupItems.add();
        item.moveToBeginning(clipGroup);
        
        // Векторный прямоугольник выступает в роли маски
        var mask = clipGroup.pathItems.rectangle(cell.y, cell.x, cell.w, cell.h);
        mask.clipping = true;
        clipGroup.clipped = true;
        
        finalGroups.push(clipGroup);
    }

    // 5. Центрирование готового коллажа на артборде
    var artboard = doc.artboards[doc.artboards.getActiveArtboardIndex()];
    var abRect = artboard.artboardRect;
    var abCenterX = (abRect[0] + abRect[2]) / 2;
    var abCenterY = (abRect[1] + abRect[3]) / 2;

    var layoutCenterX = targetW / 2;
    var layoutCenterY = -targetH / 2;

    var deltaX = abCenterX - layoutCenterX;
    var deltaY = abCenterY - layoutCenterY;

    for (var m = 0; m < finalGroups.length; m++) {
        finalGroups[m].translate(deltaX, deltaY);
    }
}