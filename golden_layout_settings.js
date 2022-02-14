const GridComponent_Commmon = {
    type: 'component',
    componentName: 'testComponent',
    isClosable: false,
}


const GridComponent_Source = Object.assign({
    title: 'ソースコード',
    componentState: { label: 'Source' }
}, GridComponent_Commmon);

const GridComponent_Input = Object.assign({
    title: 'プログラムへの入力',
    componentState: { label: 'Input' }
}, GridComponent_Commmon);

const GridComponent_Output = Object.assign({
    title: 'プログラムの出力',
    componentState: { label: 'Output' }
}, GridComponent_Commmon);

const GridComponent_Message = Object.assign({
    title: 'メッセージ',
    componentState: { label: 'Message' }
}, GridComponent_Commmon);

const GridComponent_Help = Object.assign({
    title: '使い方',
    componentState: { label: 'Help' }
}, GridComponent_Commmon);



const config_landscape = {
    settings: {
        showPopoutIcon: false,
    },
    content: [{
        type: 'column',
        content: [{
                type: 'row',
                height: 70,
                content: [{
                        type: 'stack',
                        width: 75,
                        content: [GridComponent_Source, GridComponent_Help]
                    },
                    {
                        type: 'column',
                        content: [GridComponent_Input, GridComponent_Output]
                    }
                ]
            },
            GridComponent_Message
        ]
    }]
};

const config_default = {
    settings: {
        showPopoutIcon: false,
    },
    parentId: "main",
    dimensions: {},
    content: [{
        type: 'column',
        content: [{
                type: 'stack',
                height: 60,
                content: [GridComponent_Source, GridComponent_Help]
                    // content:[GridComponent_Help, GridComponent_Source]
            },
            {
                type: 'row',
                height: 15,
                content: [GridComponent_Input, GridComponent_Output]
            },
            GridComponent_Message,
        ]
    }]
};

var myLayout, savedState = localStorage.getItem('GoldenLayout_savedState');
if (savedState !== null) {
    try {
        savedState = JSON.parse(savedState)
        savedState.maximisedItemId = null;
    } catch (e) {
        savedState = null;
    }
}

if (savedState !== null) {
    myLayout = new GoldenLayout(savedState);
} else {
    myLayout = new GoldenLayout(config_default);
}

var myLayout_containers = {};

myLayout.registerComponent('testComponent', function(container, componentState) {
    var html;
    if (componentState.label == 'Source') {
        html =
            '<div style="width: 100%; height: 100%; margin: 0;">' +
            '  <div id="source_editor_container" style="width: 100%; height: 100%; position: absolute; top:0; left:0;"></div>' +
            '  <a id="src_copy" class="copy_paste" onclick="copy_src();" style="width: 25px; height: 25px; right: 30px; top: 15px; float: right"><img src="img/copy.svg" width=80% /> <div class="description">コードをコピー</div> </a>' +
            '</div>';
    }
    if (componentState.label == 'Input') {
        html =
            '<div style="width: 100%; height: 100%; margin: 0;">' +
            '  <div id="input_editor_container" style="width: 100%; height: 100%; position: absolute; top:0; left:0;"></div>' +
            '  <a id="in_paste" class="copy_paste" onclick="paste_input();" style="width: 18px; height: 18px; right: 20px; top: 5px; float: right"><img src="img/paste.svg" width=90% /><div class="description">入力へ貼り付け<br>※クリック後、許可を押してください</div></a>' +
            '</div>';
    }
    if (componentState.label == 'Output') html = '<div id="output_editor_container" style="width: 100%; height: 100%; margin: 0;"></div>';
    if (componentState.label == 'Message') html = '<div id="message_container"       style="width: 100%; height: 100%; margin: 0;"></div>';
    if (componentState.label == 'Help') html = document.getElementById("help");

    myLayout_containers[componentState.label] = container;
    container.getElement().html(html);
});
myLayout.registerComponent('SourceComponent', function(container, componentState) {
    var html;
    if (componentState.label == 'Source') html = '<div id="source_editor_container" style="width: 100%; height: 100%; margin: 0;"></div>';
    container.getElement().html(html);
});

myLayout.on('stateChanged', function() {
    var state = myLayout.toConfig();
    state = JSON.stringify(state);
    localStorage.setItem('GoldenLayout_savedState', state);
    myLayout_containers.Input.setTitle(myLayout_containers.Input.width　 < 150 ? "入力" : "プログラムへの入力");
    myLayout_containers.Output.setTitle(myLayout_containers.Output.width < 150 ? "出力" : "プログラムの出力");
});

myLayout.container = "#golden_layout_container";
myLayout._isFullPage = true;
myLayout.init();

function reset_golden_layout(layout) {
    var state;
    if (layout == "default") {
        state = JSON.stringify(config_default);
    } else if (layout == "landscape") {
        state = JSON.stringify(config_landscape);
    } else {
        return;
    }
    localStorage.setItem('GoldenLayout_savedState', state);
    alert("レイアウト情報をリセットしました。ページの再読み込みをすると反映されます。");
}

document.getElementById('help_cpp_options').textContent = cpp_options.join(' ');