module.exports = function (electron) {
    var express = require('express');
    var fs = require('fs');
    var path = require("path");
    var app = express();
    var querystring = require('querystring');
    var URL = require('url');
    // var _debugger = process.env.ELECTRON_ENABLE_LOGGING ?  false : true;
    var baseurl = path.join(__dirname, '/');
    app.use(express.static(baseurl + 'dist'));
    //  主页输出 "Hello World"
    app.get('/', function (req, res) {
        console.log("主页 GET 请求");
        fs.readFile(baseurl + 'dist/index.html', function (err, data) {
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });

            // 响应文件内容
            res.write(data.toString());
        })

    })


    //  POST 请求 添加课程
    app.post('/api/addSubject', function (req, res) {
        var param = '';
        req.on('data', function (data) {
            param += data;
        })
        req.on('end', function () {
            param = decodeURI(param);
            var dataObject = JSON.parse(param);
            fs.readdir(baseurl + 'lesson/' + dataObject.name, function (err, file) {
                if (err) {
                    fs.mkdir(baseurl + 'lesson/' + dataObject.name, function (err) {
                        if (err) {
                            return console.error(err);
                        }

                        fs.readFile(baseurl + "lesson/config.json", function (err, data) {
                            var _data = JSON.parse(data.toString());
                            var new_id = createRandomId("subject");
                            _data.config.dir.push({
                                name: dataObject.name,
                                id: new_id
                            })
                            _data.config.total = _data.config.dir.length;
                            var _chapterConf = {
                                config: {
                                    dir: [],
                                    total: 0
                                }
                            }
                            fs.writeFileSync(baseurl + 'lesson/' + dataObject.name + '/chapterConfig.json', JSON.stringify(_chapterConf));
                            fs.writeFile(baseurl + "lesson/config.json", JSON.stringify(_data), function (err) {
                                if (err) {
                                    return console.log(err)
                                }
                                console.log("目录创建成功。");
                                res.send({
                                    state: true,
                                    msg: '目录创建成功。',
                                    data: {
                                        id: new_id
                                    }
                                })
                            })
                        })

                    });
                } else {
                    res.send({
                        state: false,
                        msg: '目录已存在'
                    })
                }
            })
        })
    })

    //  POST 请求 获取课程列表
    app.post('/api/getSubjectList', function (req, res) {
        var param = '';
        fs.readFile(baseurl + 'lesson/config.json', function (err, file) {
            if (err) {
                return console.log(err)
            }
            res.send({
                dataList: JSON.parse(file.toString()).config.dir
            });
        })

    })

    //  POST 请求 删除课程
    app.post('/api/delSubject', function (req, res) {
        var param = '';
        req.on('data', function (data) {
            param += data;
        })
        req.on('end', function () {
            param = decodeURI(param);
            var dataObject = JSON.parse(param);
            fs.readFile(baseurl + "lesson/config.json", function (err, data) {
                if (err) return console.log(err);
                var _data = JSON.parse(data.toString());
                for (var i = 0; i < _data.config.dir.length; i++) {
                    if (_data.config.dir[i].id == dataObject.id) {
                        removeDir(baseurl + "lesson/" + _data.config.dir[i].name);
                        _data.config.dir.splice(i--, 1);
                    }
                }
                _data.config.total = _data.config.dir.length;
                fs.writeFile(baseurl + "lesson/config.json", JSON.stringify(_data), function (err) {
                    if (err) return console.log(err);
                    res.send("删除成功");
                })
            })
        })
    })

    function removeDir(url) {
        var files = fs.readdirSync(url);
        if (files.length == 0) {
            fs.rmdirSync(url);
        } else {
            for (var i = 0; i < files.length; i++) {
                var index = i;
                var stats = fs.statSync(url + '/' + files[index].toString())
                if (stats.isDirectory()) {
                    removeDir(url + '/' + files[index].toString());
                } else if (stats.isFile()) {
                    fs.unlinkSync(url + '/' + files[index].toString())
                }
            }
            fs.rmdirSync(url);
        }
    }
    //  POST 请求 修改课程
    app.post('/api/changeSubject', function (req, res) {
        var param = '';
        req.on('data', function (data) {
            param += data;
        })
        req.on('end', function () {
            param = decodeURI(param);
            var dataObject = JSON.parse(param);
            console.log(dataObject)
            fs.readFile(baseurl + "lesson/config.json", function (err, data) {
                if (err) return console.log(err);
                var _data = JSON.parse(data.toString());
                var msgFlag = false;
                var _newConfig = [];
                for (var i = 0; i < dataObject.dataList.length; i++) {
                    _newConfig.push({
                        id: dataObject.dataList[i].id,
                        name: dataObject.dataList[i].name
                    })
                    for (var j = 0; j < _data.config.dir.length; j++) {
                        if (dataObject.dataList[i].id == _data.config.dir[j].id && dataObject.dataList[i].name != _data.config.dir[j].name) {
                            fs.renameSync(baseurl + "lesson/" + _data.config.dir[j].name, baseurl + "lesson/" + dataObject.dataList[i].name);
                            msgFlag = true;
                        }
                    }
                }
                _data.config.dir = _newConfig;
                _data.config.total = _newConfig.length;
                fs.writeFile(baseurl + "lesson/config.json", JSON.stringify(_data), function (err) {
                    if (err) return console.log(err);
                    res.send({
                        msg: msgFlag ? '重命名完成' : '没有修改的目录',
                        state: msgFlag
                    })
                })

            })
        })

    })

    //  POST 请求 获取课程章节列表
    app.post('/api/getChapterList', function (req, res) {
        try {
            var param = '';
            req.on('data', function (data) {
                param += data;
            })
            req.on('end', function () {
                param = decodeURI(param);
                var dataObject = JSON.parse(param);
                fs.readFile(baseurl + "lesson/config.json", function (err, data) {
                    if (err) return console.log(err);
                    data = JSON.parse(data.toString());
                    for (var i = 0; i < data.config.dir.length; i++) {
                        if (data.config.dir[i].id == dataObject.id) {
                            fs.readFile(baseurl + "lesson/" + data.config.dir[i].name + "/chapterConfig.json", function (err, data) {
                                if (err) return console.log(err);
                                res.send(JSON.parse(data.toString()).config.dir);
                            })
                            break;
                        }
                    }
                })
            })
        } catch {
            res.send({
                msg: "服务器错误"
            })
        }
    })

    //  POST 请求 添加章节
    app.post('/api/addChapter', function (req, res) {
        var param = '';
        req.on('data', function (data) {
            param += data;
        })
        req.on('end', function () {
            param = decodeURI(param);
            var dataObject = JSON.parse(param);
            var chapterName = getChapterName(dataObject.subdirid);
            fs.readFile(baseurl + 'lesson/' + chapterName + '/' + dataObject.name + '.json', function (err, file) {
                if (err) {
                    var _newLesson = {
                        letter: [],
                        testcount: 0,
                        weightAverage: 0
                    }
                    fs.writeFile(baseurl + 'lesson/' + chapterName + '/' + dataObject.name + '.json', JSON.stringify(_newLesson), function (err) {
                        if (err) return console.log(err);
                        fs.readFile(baseurl + 'lesson/' + chapterName + '/chapterConfig.json', function (err, data) {
                            var _data = JSON.parse(data.toString());
                            var _newId = createRandomId("chapter");
                            _data.config.dir.push({
                                name: dataObject.name,
                                id: _newId,
                                createtime: new Date().getTime()
                            })
                            _data.config.total = _data.config.dir.length;
                            fs.writeFile(baseurl + 'lesson/' + chapterName + '/chapterConfig.json', JSON.stringify(_data), function (err) {
                                if (err) return console.log(err);
                                res.send({
                                    state: true,
                                    msg: '章节新建成功',
                                    data: {
                                        id: _newId
                                    }
                                })
                            })
                        })

                    })
                } else {
                    res.send({
                        state: false,
                        msg: '目录已存在'
                    })
                }
            })
        })
    })

    //  POST 请求 删除章节
    app.post('/api/delChapter', function (req, res) {
        try {
            var param = '';
            req.on('data', function (data) {
                param += data;
            })
            req.on('end', function () {
                param = decodeURI(param);
                var dataObject = JSON.parse(param);
                var chapterName = getChapterName(dataObject.subdirid);
                fs.readFile(baseurl + 'lesson/' + chapterName + '/chapterConfig.json', function (err, data) {
                    if (err) return console.log(err);
                    var _data = JSON.parse(data.toString())
                    for (var i = 0; i < _data.config.dir.length; i++) {
                        if (dataObject.id == _data.config.dir[i].id) {
                            fs.unlink(baseurl + 'lesson/' + chapterName + '/' + _data.config.dir[i].name + '.json', function (err) {
                                if (err) return console.log(err);
                                _data.config.dir.splice(i--, 1);
                                _data.config.total = _data.config.dir.length;
                                console.log(_data)
                                fs.writeFile(baseurl + 'lesson/' + chapterName + '/chapterConfig.json', JSON.stringify(_data), function (err) {
                                    if (err) return console.log(err);
                                    res.send({
                                        state: true,
                                        msg: '删除章节成功'
                                    })
                                })

                            });
                            break;
                        }
                    }
                })
            })
        } catch {
            res.send({
                state: false,
                msg: '服务器错误'
            })
        }
    })

    //  POST 请求 修改章节
    app.post('/api/changeChapter', function (req, res) {
        var param = '';
        req.on('data', function (data) {
            param += data;
        })
        req.on('end', function () {
            param = decodeURI(param);
            var dataObject = JSON.parse(param);
            console.log(dataObject)
            var chapterName = getChapterName(dataObject.subdirid);
            fs.readFile(baseurl + "lesson/" + chapterName + "/chapterConfig.json", function (err, data) {
                if (err) return console.log(err);
                var _data = JSON.parse(data.toString());
                var msgFlag = false;
                var _newConfig = [];
                for (var i = 0; i < dataObject.dataList.length; i++) {
                    _newConfig.push(dataObject.dataList[i])
                    for (var j = 0; j < _data.config.dir.length; j++) {
                        if (dataObject.dataList[i].id == _data.config.dir[j].id && dataObject.dataList[i].name != _data.config.dir[j].name) {
                            fs.renameSync(baseurl + "lesson/" + chapterName + "/" + _data.config.dir[j].name + ".json", baseurl + "lesson/" + chapterName + "/" + dataObject.dataList[i].name + ".json");
                            msgFlag = true;
                        }
                    }
                }
                _data.config.dir = _newConfig;
                _data.config.total = _newConfig.length;
                fs.writeFile(baseurl + "lesson/" + chapterName + "/chapterConfig.json", JSON.stringify(_data), function (err) {
                    if (err) return console.log(err);
                    res.send({
                        msg: msgFlag ? '重命名完成' : '没有修改的章节',
                        state: msgFlag
                    })
                })

            })
        })

    })


    //  POST 请求 获取课程章节内容单词
    app.post('/api/getLetter', function (req, res) {
        try {
            var param = '';
            req.on('data', function (data) {
                param += data;
            })
            req.on('end', function () {
                param = decodeURI(param);
                var dataObject = JSON.parse(param);
                var chapterName = getChapterName(dataObject.subdirid);
                var chapterConfig = JSON.parse(fs.readFileSync(baseurl + "lesson/" + chapterName + "/chapterConfig.json").toString());
                var lessonId;
                for (var i = 0; i < chapterConfig.config.dir.length; i++) {
                    if (chapterConfig.config.dir[i].id == dataObject.id) {
                        lessonId = chapterConfig.config.dir[i].name
                    }
                }
                fs.readFile(baseurl + "lesson/" + chapterName + "/" + lessonId + ".json", function (err, data) {
                    res.send({
                        dataList: JSON.parse(data.toString())
                    })
                })
            })
        } catch {
            res.send({
                msg: "服务器错误"
            })
        }
    })

    //  POST 请求 添加课程章节单词
    app.post('/api/addLetter', function (req, res) {
        try {
            var param = '';
            req.on('data', function (data) {
                param += data;
            })
            req.on('end', function () {
                param = decodeURI(param);
                var dataObject = JSON.parse(param);
                var chapterName = getChapterName(dataObject.subdirid);
                var chapterConfig = JSON.parse(fs.readFileSync(baseurl + "lesson/" + chapterName + "/chapterConfig.json").toString());
                for (var i = 0; i < chapterConfig.config.dir.length; i++) {
                    if (chapterConfig.config.dir[i].id == dataObject.id) {
                        lessonId = chapterConfig.config.dir[i].name
                    }
                }
                fs.readFile(baseurl + "lesson/" + chapterName + "/" + lessonId + ".json", function (err, data) {
                    var _letterId = createRandomId("letter");
                    var _letterList = JSON.parse(data.toString());
                    _letterList.letter.push({
                        en: dataObject.en,
                        ch: dataObject.ch,
                        id: _letterId
                    })
                    fs.writeFileSync(baseurl + "lesson/" + chapterName + "/" + lessonId + ".json", JSON.stringify(_letterList))
                    res.send({
                        id: _letterId,
                        msg: "单词创建成功",
                        state: true
                    })
                })

            })
        } catch {
            res.send({
                msg: "服务器错误"
            })
        }
    })

    //  POST 请求 修改单词
    app.post('/api/changeLetter', function (req, res) {
        var param = '';
        req.on('data', function (data) {
            param += data;
        })
        req.on('end', function () {
            param = decodeURI(param);
            var dataObject = JSON.parse(param);
            var chapterName = getChapterName(dataObject.subdirid);
            fs.readFile(baseurl + "lesson/" + chapterName + "/chapterConfig.json", function (err, data) {
                var _data = JSON.parse(data.toString());
                var _newLesson;
                for (var i = 0; i < _data.config.dir.length; i++) {
                    if (_data.config.dir[i].id == dataObject.lessonid) {
                        _newLesson = _data.config.dir[i].name;
                    }
                }
                fs.readFile(baseurl + "lesson/" + chapterName + "/" + _newLesson + ".json", function (err, data) {
                    if (err) return;
                    var _letterList = JSON.parse(data.toString());
                    for (var i = 0; i < _letterList.letter.length; i++) {
                        if (_letterList.letter[i].id == dataObject.id) {
                            _letterList.letter[i].en = dataObject.en;
                            _letterList.letter[i].ch = dataObject.ch;
                        }
                    }
                    fs.writeFileSync(baseurl + "lesson/" + chapterName + "/" + _newLesson + ".json", JSON.stringify(_letterList));
                    res.send({
                        state: true,
                        msg: "修改成功"
                    })
                })
            })
        })

    })

    //  POST 请求 删除单词
    app.post('/api/delLetter', function (req, res) {
        var param = '';
        req.on('data', function (data) {
            param += data;
        })
        req.on('end', function () {
            param = decodeURI(param);
            var dataObject = JSON.parse(param);
            var chapterName = getChapterName(dataObject.subdirid);
            fs.readFile(baseurl + "lesson/" + chapterName + "/chapterConfig.json", function (err, data) {
                var _data = JSON.parse(data.toString());
                var _newLesson;
                for (var i = 0; i < _data.config.dir.length; i++) {
                    if (_data.config.dir[i].id == dataObject.lessonid) {
                        _newLesson = _data.config.dir[i].name;
                    }
                }
                fs.readFile(baseurl + "lesson/" + chapterName + "/" + _newLesson + ".json", function (err, data) {
                    if (err) return;
                    var _letterList = JSON.parse(data.toString());
                    for (var i = 0; i < _letterList.letter.length; i++) {
                        if (_letterList.letter[i].id == dataObject.id) {
                            _letterList.letter.splice(i, 1);
                            break;
                        }
                    }
                    fs.writeFileSync(baseurl + "lesson/" + chapterName + "/" + _newLesson + ".json", JSON.stringify(_letterList));
                    res.send({
                        state: true,
                        msg: "删除成功"
                    })
                })
            })
        })

    })

    //  POST 请求 上传一个测验单，传回测验成绩
    app.post('/api/submitTest', function (req, res) {
        var param = '';
        req.on('data', function (data) {
            param += data;
        })
        req.on('end', function () {
            param = decodeURI(param);
            var dataObject = JSON.parse(param);
            var chapterName = getChapterName(dataObject.subdirid);
            fs.readFile(baseurl + "lesson/" + chapterName + "/chapterConfig.json", function (err, data) {
                var _data = JSON.parse(data.toString());
                var _newLesson;
                for (var i = 0; i < _data.config.dir.length; i++) {
                    if (_data.config.dir[i].id == dataObject.lessonid) {
                        _newLesson = _data.config.dir[i].name;
                    }
                }
                fs.readFile(baseurl + "lesson/" + chapterName + "/" + _newLesson + ".json", function (err, data) {
                    if (err) return;

                    var _letterList = JSON.parse(data.toString());
                    var _dictate = dictationHandler(_letterList.letter, dataObject.dataList);
                    _letterList.letter = _dictate.letter;
                    _letterList.testcount = _letterList.testcount ? _letterList.testcount + 1 : 1;
                    _letterList.score = _dictate.score;

                    var _letterWritten = JSON.parse(data.toString());
                    _letterWritten.letter = dictationWriteFile(_letterWritten.letter, dataObject.dataList);
                    _letterWritten.testcount = _letterList.testcount;

                    fs.writeFileSync(baseurl + "lesson/" + chapterName + "/" + _newLesson + ".json", JSON.stringify(_letterWritten));
                    computeWeight();
                    res.send({
                        state: true,
                        msg: "测验完成",
                        data: _letterList
                    })
                })
            })
        })

    })

    function dictationHandler(list, test) {
        var _arr = [];
        var n = 0;
        for (var i = 0; i < list.length; i++) {
            var _item = list[i];
            _item.youranswer = test[i].en;
            if (list[i].en == test[i].en) {
                _item.mark = true;
                n++
            } else {
                _item.mark = false;
                _item.mistakecount = _item.mistakecount ? _item.mistakecount + 1 : 1;
            }
            _arr.push(_item);
        }
        return {
            letter: _arr,
            score: (n / list.length).toFixed(2)
        };
    }

    function dictationWriteFile(list, test) {
        var _arr = [];
        for (var i = 0; i < list.length; i++) {
            var _item = list[i];
            if (list[i].en != test[i].en) {
                _item.mistakecount = _item.mistakecount ? _item.mistakecount + 1 : 1;
            }
            _arr.push(_item);
        }
        return _arr;
    }

    function getChapterName(id) {
        var _conf = JSON.parse(fs.readFileSync(baseurl + "lesson/config.json").toString());
        var name;
        for (var i = 0; i < _conf.config.dir.length; i++) {
            if (id == _conf.config.dir[i].id) {
                name = _conf.config.dir[i].name;
            }
        }
        return name;
    }

    function createRandomId(str) {
        return str + (Math.random() * 10000000).toString(16).substr(0, 4) + '-' + (new Date()).getTime() + '-' + Math.random().toString().substr(2, 5);
    }

    function computeWeight() {
        //配置权重系数，测试中的成绩权重设置为5
        var weightConfig = {
            mistakecount: 19,
            overturn: 1,
            total: 20
        }
        var mainConf = JSON.parse(fs.readFileSync(baseurl + "lesson/config.json").toString());
        var chapterDir = mainConf.config.dir;
        //循环读取存储单词的文件，进行操作
        for (var i = 0; i < chapterDir.length; i++) {
            var chapterItem = JSON.parse(fs.readFileSync(baseurl + "lesson/" + chapterDir[i].name + "/chapterConfig.json").toString());
            var lessonDir = chapterItem.config.dir;
            for (var j = 0; j < lessonDir.length; j++) {
                var letter = JSON.parse(fs.readFileSync(baseurl + "lesson/" + chapterDir[i].name + "/" + lessonDir[j].name + ".json").toString());
                var letterDir = letter.letter;
                var allweight = 0, totalscore = 0, misscore = 0;
                for (var x = 0; x < letterDir.length; x++) {
                    //取全部权重总和
                    if (!letterDir[x].mistakecount) {
                        letterDir[x].mistakecount = 0;
                    }
                    allweight += letterDir[x].mistakecount * (weightConfig.mistakecount / weightConfig.total) + letterDir[x].overturn * (weightConfig.overturn / weightConfig.total);
                    //取记录中全部的测试总分
                    totalscore += letter.testcount;
                    //取当前课节所有错误的分数
                    misscore += letterDir[x].mistakecount;
                }
                //计算平均分,存到课节的config文件
                lessonDir[j].averageScore = totalscore ? (1 - misscore / totalscore).toFixed(2) : "0";
                lessonDir[j].createtime = new Date().getTime();
                var weightPercentTotal = 0;
                for (var y = 0; y < letterDir.length; y++) {
                    //逐个计算权重占比
                    letterDir[y].weightPercent = (letterDir[y].mistakecount * (weightConfig.mistakecount / weightConfig.total) + letterDir[y].overturn * (weightConfig.overturn / weightConfig.total)) / allweight;
                    weightPercentTotal += letterDir[y].weightPercent;
                    letterDir[y]
                }
                letter.letter = letterDir;
                letter.weightAverage = weightPercentTotal / letterDir.length; //赋权重平均值
                fs.writeFileSync(baseurl + "lesson/" + chapterDir[i].name + "/" + lessonDir[j].name + ".json", JSON.stringify(letter))
            }
            chapterItem.config.dir = lessonDir;

            //计算今日智能推荐复习计划列表
            var _todayList = [];
            for (var x = 0; x < chapterItem.config.dir.length; x++) {
                var _rvTime = reviewTime(chapterItem.config.dir[x].createtime, chapterItem.config.dir[x].reviewcount);               
                if (parseInt(_rvTime / (1000 * 60 * 60 * 24)) <= parseInt(new Date().getTime() / (1000 * 60 * 60 * 24))) {
                    var _missday = parseInt(new Date().getTime() / (1000 * 60 * 60 * 24)) - parseInt(_rvTime / (1000 * 60 * 60 * 24));
                    var _item = chapterItem.config.dir[x];
                    _item.missday = _missday;
                    _todayList.push(_item);
                }
            }
            _todayList.sort(function (a,b) {
                if ((a.missday+1-a.averageScore)-(b.missday+1-b.averageScore) > 0) {
                    return -1;
                } else {
                    return 1;
                }
                return 0;
            })
            chapterItem.config.todaylist = _todayList;
            fs.writeFileSync(baseurl + "lesson/" + chapterDir[i].name + "/chapterConfig.json", JSON.stringify(chapterItem));
        }
    }

    //  POST 请求 修改章节
    app.post('/api/changeLessonOverturn', function (req, res) {
        var param = '';
        req.on('data', function (data) {
            param += data;
        })
        req.on('end', function () {
            param = decodeURI(param);
            var dataObject = JSON.parse(param);
            console.log(dataObject)
            var chapterName = getChapterName(dataObject.subdirid);
            fs.readFile(baseurl + "lesson/" + chapterName + "/chapterConfig.json", function (err, data) {
                if (err) return console.log(err);
                var _data = JSON.parse(data.toString());
                var _newLesson = getLessonName(dataObject.subdirid, dataObject.lessonid);
                fs.readFile(baseurl + "lesson/" + chapterName + "/" + _newLesson + ".json", function (err, data) {
                    if (err) return;
                    var _data = JSON.parse(data.toString());
                    for (var i = 0; i < dataObject.dataList.length; i++) {
                        for (var j = 0; j < _data.letter.length; j++) {
                            if (_data.letter[j].id == dataObject.dataList[i].id) {
                                _data.letter[j].overturn = dataObject.dataList[i].overturn ? dataObject.dataList[i].overturn : 0;
                            }
                        }
                    }
                    fs.writeFileSync(baseurl + "lesson/" + chapterName + "/" + _newLesson + ".json", JSON.stringify(_data));
                })
                computeWeight();
                fs.writeFile(baseurl + "lesson/" + chapterName + "/chapterConfig.json", JSON.stringify(_data), function (err) {
                    if (err) return console.log(err);
                    res.send({
                        msg: '修改完成',
                        state: true
                    })
                })

            })
        })

    })

    function getLessonName(chapterid, lessonid) {
        var chapterName = getChapterName(chapterid);
        var _conf = JSON.parse(fs.readFileSync(baseurl + "lesson/" + chapterName + "/chapterConfig.json").toString());
        var name;
        for (var i = 0; i < _conf.config.dir.length; i++) {
            if (lessonid == _conf.config.dir[i].id) {
                name = _conf.config.dir[i].name;
            }
        }
        return name;
    }
    //用一个数列算法估计复习的时间曲线
    function reviewTime(createTime, n) {
        var a = 0;
        var arr = [0, 1, 2];
        var result = 0;
        var _n = parseInt(n);
        if (_n < 3) {
            return parseInt(createTime) + arr[_n] * 1000 * 60 * 60 * 24
        }
        while (_n > 2) {
            a = arr[arr.length - 1] + arr[arr.length - 2];
            arr.push(a);
            _n--
        }
        return parseInt(createTime) + a * 1000 * 60 * 60 * 24;
    }

    //  POST 请求 获取今日复习计划列表
    app.get('/api/getTodayList', function (req, res) {
        fs.readFile(baseurl + "lesson/config.json", function (err, data) {
            if (err) return console.log(err);
            try {
                data = JSON.parse(data.toString());
                var todaylist = []
                for (var i = 0; i < data.config.dir.length; i++) {
                    var list = fs.readFileSync(baseurl + "lesson/" + data.config.dir[i].name + "/chapterConfig.json");
                    var todayItem = {
                        name: data.config.dir[i].name,
                        id: data.config.dir[i].id,
                        list: JSON.parse(list.toString()).config.todaylist.splice(0, 4)
                    };
                    todaylist.push(todayItem);
                }
                res.send(todaylist);
            } catch {
                res.send({
                    msg: "服务器错误"
                })
            }
        })

    })

    var server = app.listen(8081, function () {

        var host = server.address().address
        var port = server.address().port
        computeWeight()
        setInterval(computeWeight, 60000)
        console.log("应用实例，访问地址为 http://" + host + ":" + port)

    })
}