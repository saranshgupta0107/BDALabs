var arr1 = ['feedback_id', 'course_id', 'comment', 'year', 'time'];
var checkbox = ['check1', 'check2', 'check3', 'check4', 'check5'];
var tbody = document.getElementById('Tbody');

var rows = 0, seeds, collumns;

var statechange = false;
var checked = [false, false, false, false, false];

function addLis(check, id, i) {
    if (document.getElementById(check).checked) {
        if (!checked[i]) {
            checked[i] = 1;
            statechange = true;
            rows++;
        }
        document.getElementById(id).style.display = '';

    } else {
        if (checked[i]) {
            checked[i] = 0;
            statechange = true;
            rows--;
        }
        document.getElementById(id).style.display = 'none';
    }
    change();
}

for (var i = 0; i < 5; i++) {
    setInterval(addLis, 100, checkbox[i], arr1[i], i);
}

var tbody = document.getElementById('Tbody');

function change() {
    var columns = parseInt(document.getElementById('columns').value);
    var seed = parseInt(document.getElementById('seed').value);
    if (seed == seeds && collumns == columns && statechange == false) return;
    statechange = false;
    seeds = seed;
    collumns = columns;
    tbody.innerHTML = '';
    var stri = '';
    for (var i = 0; i < columns; i++) {
        stri += "<tr>";
        for (var j = 0; j < rows; j++) {
            stri += ("<td>" + (seed++) + "</td>");
        }
        stri += "</tr>";
    }
    tbody.innerHTML = stri;
}