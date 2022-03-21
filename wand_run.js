// Module.onRuntimeInitialized = function () {
//     _initialized();
// }
require.config({
    paths: { 'vs': './node_modules/monaco-editor/min/vs' },
    'vs/nls': { availableLanguages: { '*': 'ja' } }
});

var previous_source_text = localStorage.getItem('source_editor');
var previous_input_text = localStorage.getItem('input_editor');
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

//  const new_fonst_size = source_editor.getOption(monaco.editor.EditorOption.fontSize);

const editor_options = {
    minimap: { enabled: false },
    bracketPairColorization: { enabled: true },
    mouseWheelZoom: true,
    automaticLayout: true,
    renderControlCharacters: true,
    lineDecorationsWidth: 0,
    copyWithSyntaxHighlighting: false,
    // stickyTabStops: true,
    useTabStops: true,
    fontSize: previous_font_size,
}

const cpp_editor_options = Object.assign({
    language: 'cpp',
    value: previous_source_text,
    renderWhitespace: true,
    lineNumbersMinChars: 2,
    glyphMargin: true,
    "bracketPairColorization.enabled": true,
}, editor_options);

const io_editor_options = Object.assign({
    language: 'myCustomLanguage',
    // theme: 'myCustomTheme',
    lineNumbers: false,
    scrollBeyondLastLine: false,
    renderWhitespace: false,
    folding: false,
}, editor_options);


var edit_counter = 0;

function editor_auto_save(c) {
    if (edit_counter != c) return;
    const text = source_editor.getValue();
    if (text == null || text == "") return;
    // console.log("editor save!");
    // document.cookie = 'source_editor=' + encodeURIComponent(text);
    // document.cookie = 'input_editor=' + encodeURIComponent(input_editor.getValue());
    localStorage.setItem('source_editor', encodeURIComponent(text));
    localStorage.setItem('input_editor', encodeURIComponent(input_editor.getValue()));
}

var source_editor;
var input_editor;
var output_editor;
var message_editor;

function changed_font_size() {
    const new_fonst_size = source_editor.getOption(monaco.editor.EditorOption.fontSize);
    localStorage.setItem('fonst_size', new_fonst_size);
}

require(['vs/editor/editor.main'], function() {
    monaco.languages.register({
        id: 'myCustomLanguage'
    });
    monaco.languages.setMonarchTokensProvider('myCustomLanguage', {
        tokenizer: {
            root: [
                [/(error|ERROR|Error).*/, "constant"], // "invalid"
                [/[0-9]+/, "number.hex"],
            ],
        }
    });

    source_editor = monaco.editor.create(document.getElementById('source_editor_container'), cpp_editor_options);
    source_editor.getModel().onDidChangeContent((event) => {
        ++edit_counter;
        setTimeout(editor_auto_save, 3000, edit_counter);
    });
    source_editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        wand_run();
    })
    source_editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        editor_auto_save(++edit_counter);
    })
    source_editor.onDidContentSizeChange(changed_font_size);

    //////
    input_editor = monaco.editor.create(document.getElementById('input_editor_container'),
        Object.assign({
            value: previous_input_text,
        }, io_editor_options));
    input_editor.getModel().onDidChangeContent((event) => {
        ++edit_counter;
        setTimeout(editor_auto_save, 3000, edit_counter);
    });
    input_editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        wand_run();
    })
    input_editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            editor_auto_save(++edit_counter);
        })
        //////
    output_editor = monaco.editor.create(document.getElementById('output_editor_container'),
        Object.assign({
            value: "",
            readOnly: true,
        }, io_editor_options));
    //////
    message_editor = monaco.editor.create(document.getElementById('message_container'),
        Object.assign({
            value: [
                'message',
            ].join('\n'),
            readOnly: true,
            wordWrap: "on",
        }, io_editor_options));
});





document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key == 'Shift') {
        showMessage();
    }
});

function showMessage() {
    var text = source_editor.getValue();
    // alert(text);
    test1(text);
}

function monaco_reset_text(editor, text = "") {
    editor.setValue(text);
}

function monaco_add_text(editor, text) {
    const isBottom = editor.getScrollTop() + editor.getDomNode().clientHeight + 1 >= editor.getContentHeight();
    editor.setValue(editor.getValue() + text);
    if (isBottom) {
        editor.setScrollTop(1e20);
    }
}

function reset_editor_compile_error_glyph() {
    if (source_editor.decorations != null) {
        source_editor.decorations = source_editor.deltaDecorations(source_editor.decorations, []);
    }
    if (source_editor.markers) {
        source_editor.markers = [];
        monaco.editor.setModelMarkers(source_editor.getModel(), 'compile_message', source_editor.markers);
    }
}

const include_relationship = {
    string: "string",
    cin: "iostream",
    cout: "iostream",
    endl: "iostream",
    vector: "vector",
}

function get_message_easy_to_understand(text) {
    var m;
    const did_you_mean = ((m = text.match(/did you mean '(.+?)'\?/)) ? ("\n（もしかして「" + m[1] + "」の間違いですか？）") : "");

    if ((m = text.match(/'(.+?)' is not a member of 'std'/)) && (m[1] in include_relationship)) {
        return "「" + m[1] + "」を使用するためには、プログラムの先頭で「#include <" + include_relationship[m[1]] + ">」を書かないといけません。" + did_you_mean;
    }
    if ((m = text.match(/'(.+?)' was not declared in this scope; did you mean 'std::(.+?)'\?/)) && m[1] == m[2]) {
        return "「" + m[1] + "」を使用するためには「std::" + m[1] + "」と書き直すか、プログラムの先頭で「using namespace std;」を書かないといけません。" + did_you_mean;
    }
    if (m = text.match(/'(.+?)' was not declared in this scope/)) {
        if (m[1] in include_relationship) {
            if (m[1] == "string") {
                return "「" + m[1] + "」を使用するためには、プログラムの先頭で「#include <" + include_relationship[m[1]] + ">」を書かないといけません。\n" +
                    "そしてさらに「std::" + m[1] + "」と書くか、プログラムの先頭で「using namespace std;」を書かないといけません。" + did_you_mean;
            } else {
                return "「" + m[1] + "」を使用するためには、プログラムの先頭で「#include <" + include_relationship[m[1]] + ">」を書かないといけません。" + did_you_mean;
            }
        }
        if (m[1] == "end1") {
            return "宣言されてない変数「" + m[1] + "」が使用されました。「endl」(最後の文字は数字の1ではなく、小文字のL) の間違いではありませんか。" + did_you_mean;
        }
        return "宣言されてない変数「" + m[1] + "」が使用されました。C++では使用する変数をあらかじめ宣言して用意する必要があります。他にもタイピングミスの可能性もあります。" + did_you_mean;
    }
    if (m = text.match(/redeclaration of '(.+?)'/)) {
        return "「" + m[1] + "」が再宣言されました。前に同名の変数を宣言していませんか。" + did_you_mean;
    }
    if (m = text.match(/redefinition of '(.+?)'/)) {
        return "「" + m[1] + "」が再定義されました。前に同じ関数を宣言していませんか。" + did_you_mean;
    }
    if (m = text.match(/'(.+?)' redeclared as different kind of entity/)) {
        return "「" + m[1] + "」が再定義されました。前に同名の変数や関数を宣言していませんか。" + did_you_mean;
    }
    if (m = text.match(/conflicting declaration '(.+?)'/)) {
        return "「" + m[1] + "」の宣言が衝突しました。前に同名の変数や関数を宣言していませんか。" + did_you_mean;
    }
    if (m = text.match(/expected '(.+?)' before '(.+?)'/)) {
        return "「" + m[2] + "」の前に、「" + m[1] + "」が来ることが期待されています。どこかで「" + m[1] + "」を忘れていませんか。" + did_you_mean;
    }
    if (m = text.match(/expected '(.+?)' at end of input/)) {
        return "「" + m[1] + "」が来ることが期待されていましたが、ソースコードの最後までありませんでした。どこかで忘れていませんか。" + did_you_mean;
    }
    if (m = text.match(/expected declaration before '\}' token/)) {
        return "期待されていない「}」があります。どこかで「{」を忘れていませんか。" + did_you_mean;
    }
    if (m = text.match(/expected initializer before '(.+?)'/)) {
        return "「" + m[1] + "」の前に宣言・初期化文が来ることが期待されています。「;」などを忘れていませんか。" + did_you_mean;
    }
    if (m = text.match(/expected primary-expression before '\)' token/)) {
        return "期待されていない「)」があります。どこかで「(」を忘れていませんか。" + did_you_mean;
    }
    if (m = text.match(/expected primary-expression before '(.+?)' token/)) {
        return "演算子「" + m[1] + "」の使い方が間違えています。" + did_you_mean;
    }
    if (m = text.match(/expected (.+?) before (.+)/)) {
        return m[2] + " の前に、" + m[1] + " が来ることが期待されています。" + did_you_mean;
    }

    if (m = text.match(/stray '\\\d+' in program/)) {
        return "半角文字以外が混じっています。C++では全角文字・全角スペース・全角記号などは使用できません。" + did_you_mean;
    }
    if (m = text.match(/no match for 'operator(.+?)' \(operand types are '(.+?)'( \{aka.*?'\})? and '(.+?)'/)) {
        return m[2] + " (左辺)と " + m[4] + " (右辺)を演算子「" + m[1] + "」を使って演算はできません。" + did_you_mean;
    }
    if (m = text.match(/invalid operands of types '(.+?)'( \{aka.*?'\})? and '(.+?)'( \{aka.*?'\})? to binary 'operator(.+?)'/)) {
        return m[1] + " (左辺)と " + m[3] + " (右辺)を演算子「" + m[5] + "」を使って演算はできません。" + did_you_mean;
    }
    if (m = text.match(/incompatible types in assignment of '(.+?)' to '(.+?)'/)) {
        return "「" + m[2] + "」型に「" + m[1] + "」型の値は入れられません。型や添字が合っているか確認してください。" + did_you_mean;
    }
    if (m = text.match(/invalid conversion from '(.+?)' to '(.+?)'/)) {
        return "「" + m[2] + "」型に「" + m[1] + "」型の値を変換できません。型や添字が合っているか確認してください。" + did_you_mean;
    }
    if (m = text.match(/cannot convert '(.+?)' to '(.+?)' in assignment/)) {
        return "「" + m[2] + "」型に「" + m[1] + "」型の値を変換できません。型や添字が合っているか確認してください。" + did_you_mean;
    }
    if (m = text.match(/cannot declare '::main' to be a global variable/)) {
        return "「int main()」の「()」を忘れていませんか。" + did_you_mean;
    }
    if (m = text.match(/(.+?): No such file or directory/)) {
        return "「" + m[1] + "」と言うファイルは見つかりませんでした。名前を間違えていないか確認してください。" + did_you_mean;
    }
    if (m = text.match(/assignment of read-only variable '(.+?)'/)) {
        return "変数「" + m[1] + "」は書き換えができない変数です。" + did_you_mean;
    }

    // warnings
    if (m = text.match(/'(.+?)' may be used uninitialized in this function/)) {
        return "変数「" + m[1] + "」は恐らく初期化されていないため、意図しない値が入っています。使用する前に代入をしてください。" + did_you_mean;
    }
    if (m = text.match(/unused variable '(.+?)'/)) {
        return "変数「" + m[1] + "」は使用されていません。" + did_you_mean;
    }
    if (m = text.match(/declaration of '(.+?)' shadows/)) {
        return "変数「" + m[1] + "」が、外側にも同名の変数があり、重複しています。" + did_you_mean;
    }
    if (m = text.match(/suggest parentheses around assignment used as truth value/)) {
        return "値を比較するのに「==」ではなく「=」を使用していませんか。" + did_you_mean;
    }
    if (m = text.match(/comparing floating point with == or != is unsafe/)) {
        return "「==」や「!=」を使って、double や float などの浮動小数点数の比較をするのは、誤差の観点から安全ではありません。整数での計算に置き換えるか、誤差を考慮して「<」や「>」で置き換えられないか検討しましょう。" + did_you_mean;
    }
    if (m = text.match(/statement has no effect/)) {
        return "この文は何の効果ももらたしていません。何か書き間違えをしていませんか。" + did_you_mean;
    }
    return "" + did_you_mean;
}

function get_runtime_message_easy_to_understand(text) {
    var m;
    if (m = text.match(/index (.+?) out of bounds for type '(.+?)'/)) {
        return m[1] + "番目の要素にアクセスしようとしましたが、サイズの範囲を超えています。";
    }
    if (m = text.match(/integer overflow: (.+?) cannot be represented in type '(.+?)'/)) {
        return "オーバーフロー: " + m[1] + " は '" + m[2] + "' で計算できる数値の範囲を超えています。";
    }
    return "";
}


const error_waring_pattern = /^prog.cc:(\d+):(\d+): (warning|error|fatal error): (.*)$/;
const runtime_error_pattern = /^prog.cc:(\d+):(\d+): (runtime error): (.*)$/;
const message_token_pattern = /^.*?'(.+?)'.*$/;
const remove_escape_sequence_pattern = /\x1b\[\d\d?(;\d\d?)?(;\d\d?)?[m]/g;

function parse_compile_message(text, is_runtime) {
    // console.log("parse_compile_message", text);

    const txt_array = text.split('\n');
    var prev = source_editor.decorations || [];
    var markers = source_editor.markers || [];

    for (var i in txt_array) {
        const m = txt_array[i].match(is_runtime ? runtime_error_pattern : error_waring_pattern);
        // console.log("###", txt_array[i], m);
        if (m != null) {
            // console.log(m);
            // console.log("------------");

            const easy_message = is_runtime ? get_runtime_message_easy_to_understand(m[4]) : get_message_easy_to_understand(m[4]);

            const e = {
                line: parseInt(m[1]),
                col: parseInt(m[2]),
                severity: m[3],
                message: m[3] + ": " + m[4] + (easy_message == "" ? "" : ("\n" + easy_message))
            }
            const line_tokens = source_editor.getModel().getLineTokens(e.line);
            const token_end = line_tokens.getEndOffset(line_tokens.findTokenIndexAtOffset(e.col));
            const token_len_A = token_end - e.col;
            const message_token = m[4].match(message_token_pattern);
            const token_len_B = message_token == null ? token_len_A : message_token[1].length;
            const token_len = Math.max(1, (token_end == null ? token_len_B : Math.min(token_len_A, token_len_B)));
            // console.log("line/col", e.line, e.col, token_len_A, token_len_B);

            const newDecorations = [{
                range: new monaco.Range(e.line, e.col, e.line, e.col),
                options: {
                    glyphMarginClassName: e.severity === 'warning' ? 'warningIcon' : 'errorIcon',
                    // inlineClassName: e.severity === 'warning' ? 'warningLine' :  'errorLine',
                    glyphMarginHoverMessage: { value: e.message },
                },
            }];
            const r = source_editor.deltaDecorations([], newDecorations);
            prev = prev.concat(r);

            markers.push({
                startLineNumber: e.line,
                startColumn: e.col,
                endLineNumber: e.line,
                endColumn: e.col + token_len,
                // endColumn: e.col + token_len,
                message: e.message,
                severity: e.severity === 'warning' ? monaco.MarkerSeverity.Warning : monaco.MarkerSeverity.Error,
            });
        }
    }
    source_editor.decorations = prev;
    source_editor.markers = markers
    monaco.editor.setModelMarkers(source_editor.getModel(), 'compile_message', source_editor.markers)
}

const cpp_options = [
    "-std=gnu++17",
    "-Wall",
    "-Wextra",
    "-Wno-sign-compare", // 符号無し整数の比較警告を抑制
    "-Wfloat-equal", // 浮動小数点数を == で比較していると警告する
    "-Winit-self", // int i = i; など未定義の変数が自分を初期化すると警告する
    "-Wshadow", // 名前被りに対して警告する
    "-g",
    "-fsanitize=undefined",
    "-D_GLIBCXX_DEBUG",
    "-D_GLIBCXX_DEBUG_PEDANTIC",
];
// document.getElementById('help_cpp_options').textContent = cpp_options.join(' '),


var is_wand_running = false;

function set_wand_running_state(running) {
    var btn = document.getElementById('wand_run_btn');
    if (running) {
        is_wand_running = true;
        btn.className = 'btn btn--running'
        btn.textContent = "実行中…";
    } else {
        is_wand_running = false;
        btn.className = 'btn btn--run'
        btn.textContent = "実行";
    }
};
set_wand_running_state(false);


function wand_run() {
    if (is_wand_running) return;
    set_wand_running_state(true);

    const wand_send = {
        "code": source_editor.getValue(),
        "stdin": input_editor.getValue(),
        "compiler-option-raw": cpp_options.join('\n'),
        "compiler": "gcc-9.3.0"
            // "compiler": "clang-10.0.0"
    }
    const wand_send_json = JSON.stringify(wand_send);
    // console.log(wand_send_json);
    monaco_reset_text(output_editor);
    // monaco_reset_text(message_editor, "Wandboxで実行\n");
    monaco_reset_text(message_editor, "");
    reset_editor_compile_error_glyph();
    fetch('https://wandbox.org/api/compile.ndjson', {
        method: "POST",
        mode: 'cors',
        headers: { 'content-type': 'application/json' },
        body: wand_send_json
    }).then((response) => {
        if (!response.ok) {
            set_wand_running_state(false);
            throw new Error('Network response was not ok.');
        }
        return response.body.getReader();
    }).then((reader) => {
        function readChunk({ done, value }) {
            const txt = new TextDecoder().decode(value);
            // console.log("Wand:", done, txt);
            var txt_array = txt.split('\n');
            for (var i in txt_array) {
                if (txt_array[i].length == 0) continue;
                const json = JSON.parse(txt_array[i]);
                if (json == null) {
                    return;
                }
                if (json.type == "StdOut") {
                    monaco_add_text(output_editor, json.data);
                } else if (json.type == "StdErr") {
                    monaco_add_text(message_editor, json.data);
                    parse_compile_message(json.data, true);
                } else if (json.type == "Control") {
                    monaco_add_text(message_editor, "[Wandbox] " + json.data + "\n");
                } else if (json.type == "CompilerMessageS" || json.type == "CompilerMessageE") {
                    // const data = json.data.replace(remove_escape_sequence_pattern, "" ) ;
                    const data = json.data;
                    monaco_add_text(message_editor, data + "\n");
                    parse_compile_message(data, false);
                } else if (json.type == "ExitCode") {
                    monaco_add_text(message_editor, "[ Exit ] " + json.data + "\n");
                } else if (json.type == "Signal") {
                    monaco_add_text(message_editor, "[Signal] " + json.data + "\n");
                }
            }
            if (done) {
                set_wand_running_state(false);
                return;
            }
            reader.read().then(readChunk);
        }
        reader.read().then(readChunk);
    }).catch(error => {
        monaco_add_text(message_editor, "エラー\n");
        monaco_add_text(message_editor, error);
        console.error(error);
        set_wand_running_state(false);
    })
}

function test1(source_code) {
    var result = Module.ccall('clicked1', // name of C function
        'string', // return type
        ['number', 'string'], // argument types
        [12345678, source_code]); // arguments
    console.log("res", result);
}

function copy_text(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else if (window.clipboardData) { // for IE
        window.clipboardData.setData("Text", text);
    } else {
        alert("ブラウザがコピーに対応していません。");
    }
}

function paste_clipboard(callback_func) {
    if (navigator.clipboard) {
        navigator.clipboard.readText().then(function(text) {
            callback_func(text);
        });
    } else if (window.clipboardData) { // for IE
        var text = window.clipboardData.getData("Text");
        callback_func(text);
    } else {
        alert("ブラウザが貼り付けに対応していません。");
    }
}

function copy_src() {
    copy_text(source_editor.getValue());

    var btn = document.getElementById('src_copy');
    btn.classList.add('clicked');
    btn.addEventListener("transitionend", function() {
        btn.classList.remove('clicked');
    });
}

function paste_input() {
    paste_clipboard((text) => { input_editor.setValue(text) });

    var btn = document.getElementById('in_paste');
    btn.classList.add('clicked');
    btn.addEventListener("transitionend", function() {
        btn.classList.remove('clicked');
    });
}



var parent = document.querySelectorAll(".has-sub");

var node = Array.prototype.slice.call(parent, 0);

node.forEach(function(element) {
    element.addEventListener(
        "mouseover",
        function() {
            element.querySelector(".sub").classList.add("active");
        },
        false
    );
    element.addEventListener(
        "mouseout",
        function() {
            element.querySelector(".sub").classList.remove("active");
        },
        false
    );
});