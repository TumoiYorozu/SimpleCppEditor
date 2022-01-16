var source_editor = ace.edit("source_editor_container", {
    theme: "ace/theme/monokai",
    minLines: 2
});
source_editor.getSession().setMode("ace/mode/c_cpp");
source_editor.setOptions({
    showPrintMargin: false,
    scrollPastEnd: 0.5,
    showInvisibles: true,
});


var input_editor = ace.edit("input_editor_container", {
    theme: "ace/theme/monokai",
    minLines: 2
});
input_editor.getSession().setMode("ace/mode/markdown");
input_editor.setOptions({
    showPrintMargin: false,
    showLineNumbers: false,
    showGutter: false,
    showInvisibles: true,
});

var output_editor = ace.edit("output_editor_container", {
    theme: "ace/theme/monokai",
    minLines: 2
});
output_editor.getSession().setMode("ace/mode/markdown");
output_editor.setOptions({
    showPrintMargin: false,
    showLineNumbers: false,
    showGutter: false,
    showInvisibles: true,
    readOnly: true,
});

var message_editor = ace.edit("message_editor_container", {
    theme: "ace/theme/monokai",
    minLines: 2
});
message_editor.getSession().setMode("ace/mode/markdown");
message_editor.setOptions({
    showPrintMargin: false,
    showLineNumbers: false,
    showGutter: false,
    showInvisibles: true,
    readOnly: true,
});



source_editor.on("change", function() {
    ++edit_counter;
    setTimeout(source_editor_auto_save, 3000, edit_counter);
});
input_editor.on("change", function() {
    ++edit_counter;
    setTimeout(source_editor_auto_save, 3000, edit_counter);
});

source_editor.commands.addCommands([{
    Name: "savefile",
    bindKey: { win: "Ctrl-S", mac: "Ctrl-S" },
    exec: function(editor) { source_editor_auto_save(++edit_counter); }
}, {
    Name: "savefile",
    bindKey: { mac: "Command-S" },
    exec: function(editor) { source_editor_auto_save(++edit_counter); }
}]);
input_editor.commands.addCommands([{
    Name: "savefile",
    bindKey: { win: "Ctrl-S", mac: "Ctrl-S" },
    exec: function(editor) { source_editor_auto_save(++edit_counter); }
}, {
    Name: "savefile",
    bindKey: { mac: "Command-S" },
    exec: function(editor) { source_editor_auto_save(++edit_counter); }
}]);





function set_editor_text(editor, txt) {
    editor.setValue(txt);
}

function get_editor_text(editor) {
    return editor.getValue();
}



var edit_counter = 0;

function source_editor_auto_save(c) {
    if (edit_counter != c) return;
    const text = get_editor_text(source_editor);
    if (text == null || text == "") return;
    console.log("source_editor save!");
    localStorage.setItem('source_source_editor', encodeURIComponent(text));
    localStorage.setItem('input_source_editor', encodeURIComponent(get_editor_text(input_editor)));
}

var previous_source_text = localStorage.getItem('source_source_editor');
var previous_input_text = localStorage.getItem('input_source_editor');
var previous_font_size = localStorage.getItem('fonst_size');


if (previous_source_text != null) {
    previous_source_text = decodeURIComponent(previous_source_text);
} else {
    previous_source_text = [
        '#include <bits/stdc++.h>',
        'using namespace std;',
        '',
        'int main () {',
        '    string name;',
        '    cin >> name;',
        '    cout << "Hello, " << name << "!" << endl;',
        '',
        '    int a = 0;',
        '    int b = 1;',
        '    for(int i = 0; i < 10; i++) {',
        '        int c = a + b;',
        '        cout << b << " ";',
        '        a = b;',
        '        b = c;',
        '    }',
        '    cout << endl;',
        '}',
    ].join('\n');
}
if (previous_input_text != null) {
    previous_input_text = decodeURIComponent(previous_input_text);
} else {
    previous_input_text = "Takahashi";
}
set_editor_text(source_editor, previous_source_text);
set_editor_text(input_editor, previous_input_text);