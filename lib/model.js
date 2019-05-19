var lkModelViewer = null;
var actionFolder = null;
var skinFolder = null;
var animController = null;
var stopController = null;
var championIndex = 15;
var skinIndex = 0;
var index2name = {};
var name2index = {};
var index2skin = {};
gui = new dat.GUI();
var options = {
    英雄: "",
    皮肤: "",
    暂停: false,
    动画: false,
    动作: "",

};


$.getJSON('./assets/index2name.json', function (data) {
    $.each(data, function (key, val) {
        index2name[key] = val;
    });
    $.getJSON('./assets/index2skin.json', function (data) {
        $.each(data, function (key, val) {
            index2skin[key] = val;
        });
        options['英雄'] = index2name[championIndex.toString()];
        gui.add(options, '英雄', Object.values(index2name)).onChange(function (val) {
            championIndex = name2index[val];
            loadModel(championIndex, skinIndex);
            skinIndex = 0;
            if (stopController) {
                gui.remove(stopController);
                stopController = null;
            }
            if (actionFolder) {
                gui.remove(actionFolder);
                actionFolder = null;
            }
            if (skinFolder) {
                gui.remove(skinFolder);
                skinFolder = null;
            }
            if (animController) {
                gui.remove(animController);
                animController = null;
            }

            options['皮肤'] = index2skin[championIndex.toString()][0];
            skinFolder = gui.add(options, '皮肤', index2skin[championIndex.toString()]).onChange(function (val) {
                for (let i = 0; i < index2skin[championIndex.toString()].length; i++) {
                    if (index2skin[championIndex.toString()][i] == val) {
                        skinIndex = i;
                        break;
                    }
                }
                if (stopController) {
                    gui.remove(stopController);
                    stopController = null;
                }
                if (actionFolder) {
                    gui.remove(actionFolder);
                    actionFolder = null;
                }
                loadModel(championIndex, skinIndex);

            });

            animController = gui.add(options, "动画").onChange(function (val) {
                if (val) {
                    loadModelWithAnim(championIndex, skinIndex);
                }
                else {
                    if (stopController) {
                        gui.remove(stopController);
                        stopController = null;
                    }
                    if (actionFolder) {
                        gui.remove(actionFolder);
                        actionFolder = null;
                    }
                    loadModel(championIndex, skinIndex);
                }
            });

        });

        options['皮肤'] = index2skin[championIndex.toString()][0];
        skinFolder = gui.add(options, '皮肤', index2skin[championIndex.toString()]).onChange(function (val) {
            for (let i = 0; i < index2skin[championIndex.toString()].length; i++) {
                if (index2skin[championIndex.toString()][i] == val) {
                    skinIndex = i;
                    break;
                }
            }
            loadModel(championIndex, skinIndex);
            if (stopController) gui.remove(stopController);
            if (actionFolder) gui.remove(actionFolder);
        });

        animController = gui.add(options, "动画").onChange(function (val) {
            if (val) {
                loadModelWithAnim(championIndex, skinIndex);
            }
            else {
                loadModel(championIndex, skinIndex);
                if (stopController) gui.remove(stopController);
                if (actionFolder) gui.remove(actionFolder);
            }
        });
    });

});

$.getJSON('./assets/name2index.json', function (data) {
    $.each(data, function (key, val) {
        name2index[key] = val;
    });
});


// gui.add(options, '皮肤').onChange(function (val) {

// });


gui.autoPlace = false;

var loadModel = function (model, type) {
    var opts = {
        type: ZamModelViewer.LOL,
        container: $('#viewer'),
        aspect: document.body.clientWidth / document.body.clientHeight,
        contentPath: '/assets/',
        models: [{
            champion: model,
            skin: type
        }],
        dist: 1000,
        static: true
    };

    if (lkModelViewer) {
        lkModelViewer.destroy();
    }
    lkModelViewer = new ZamModelViewer(opts);
    // setTimeout(updateAnimations, 100);
}


var loadModelWithAnim = function (model, type) {
    var opts = {
        type: ZamModelViewer.LOL,
        container: $('#viewer'),
        aspect: document.body.clientWidth / document.body.clientHeight,
        contentPath: '/assets/',
        models: [{
            champion: model,
            skin: type
        }],
        dist: 1000,
        static: false
    };

    if (lkModelViewer) {
        lkModelViewer.destroy();
    }
    lkModelViewer = new ZamModelViewer(opts);
    setTimeout(updateAnimations, 100);
}


var setAnimation = function (anim) { // 设置动画
    if (lkModelViewer && anim) {
        lkModelViewer.method('setAnimation', anim);
    }
}

var toggleAnimation = function () {
    if (lkModelViewer) {
        t = lkModelViewer.method('toggleAnimation');
    }
}

var updateAnimations = function () {
    anims = []
    if (lkModelViewer && lkModelViewer.method('isLoaded')) {
        var numAnims = lkModelViewer.method('getNumAnimations');
        for (i = 0; i < numAnims; i++) {
            var anim = lkModelViewer.method('getAnimation', i);
            if (anim) {
                anims.push(anim);
            }

        }
        stopController = gui.add(options, '暂停').onChange(function () {
            toggleAnimation();
        })
        actionFolder = gui.add(options, '动作', anims).onChange(function (val) {
            setAnimation(val);
        });
    } else {
        setTimeout(updateAnimations, 100);
    }
}

$(function () {
    loadModel(championIndex, skinIndex);
});

