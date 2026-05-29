window.__require = function e(t, o, r) {
function a(i, s) {
if (!o[i]) {
if (!t[i]) {
var l = i.split("/");
l = l[l.length - 1];
if (!t[l]) {
var c = "function" == typeof __require && __require;
if (!s && c) return c(l, !0);
if (n) return n(l, !0);
throw new Error("Cannot find module '" + i + "'");
}
i = l;
}
var d = o[i] = {
exports: {}
};
t[i][0].call(d.exports, function(e) {
return a(t[i][1][e] || e);
}, d, d.exports, e, t, o, r);
}
return o[i].exports;
}
for (var n = "function" == typeof __require && __require, i = 0; i < r.length; i++) a(r[i]);
return a;
}({
TreegodBonusGame: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "d2783qnn8RAipUKFrLn1klj", "TreegodBonusGame");
Object.defineProperty(o, "__esModule", {
value: !0
});
var r = e("../../../script/core-slots/base/SlotsBonusGame"), a = e("../../../script/core-slots/driver/SlotsEnum"), n = e("../../../script/core-slots/driver/SlotsGameDriver"), i = e("../../../script/core-slots/driver/SlotsModel"), s = e("../../../script/core-slots/line/SlotsLinePlayer"), l = e("../../../script/core/audio-player/AudioPlayer"), c = e("../../../script/core/event/EventDispatcher"), d = e("../../../script/core/fx-player/FXPlayer"), p = e("../../../script/core/timer/TimerMgr"), u = e("../../../script/game/misc/ViewEventEnum"), f = e("./TreegodWheelView"), h = cc._decorator, y = h.ccclass, _ = h.property, m = function(e) {
__extends(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.blackbg = null;
t.forestmanGuardian2 = null;
t.norBoardAnim = null;
t.wheelView = null;
return t;
}
t.prototype.prepareBonusGame = function() {
return __awaiter(this, void 0, void 0, function() {
var t = this;
return __generator(this, function() {
n.default.Instance.pauseBgm(!1);
n.default.Instance.setBgmState(DocEnum.GameStageType.BONUS);
c.default.Instance.sendEvent(u.ViewEventEnum.SlotsOperateBarDisableAll);
if (n.default.Instance.getSlotsLogic("SlotsRoot")._reEnterGame) e.prototype.prepareBonusGame.call(this); else {
s.default.Instance.showScatter(function() {});
l.default.Instance.playEffect(a.SlotsAudio.Bells);
n.default.Instance.getSlotsLogic("SlotsSpinResult").playTreeFinish(!0);
l.default.Instance.playEffect("treegod_scater_show", !1);
p.default.Instance.addTimer(2, function() {
l.default.Instance.playEffect("treegod_scater_show", !1);
});
p.default.InstanceUnScale.addTimer(4, function() {
return __awaiter(t, void 0, void 0, function() {
var t = this;
return __generator(this, function() {
l.default.Instance.stopEffect(a.SlotsAudio.Bells);
n.default.Instance.tryShowWinnerAgainDeal(function() {
e.prototype.prepareBonusGame.call(t);
});
return [ 2 ];
});
});
});
}
return [ 2 ];
});
});
};
t.prototype.playBonusGame = function() {
return __awaiter(this, void 0, void 0, function() {
var e = this;
return __generator(this, function(t) {
switch (t.label) {
case 0:
this.blackbg.active = !0;
this.blackbg.opacity = 0;
this.blackbg.runAction(cc.fadeIn(.3));
l.default.Instance.playEffect("treegod_transition", !1);
d.default.playSpine(this.forestmanGuardian2, "transition", !1);
p.default.InstanceUnScale.addTimer(160 / 30, function() {
return __awaiter(e, void 0, void 0, function() {
return __generator(this, function(e) {
switch (e.label) {
case 0:
this.forestmanGuardian2.active = !1;
this.wheelView.node.active = !0;
this.wheelView.node.opacity = 255;
return [ 4, this.wheelView.playBonusIn() ];

case 1:
e.sent();
return [ 2 ];
}
});
});
});
return [ 4, p.default.InstanceUnScale.addTimerAsync(5) ];

case 1:
t.sent();
this.blackbg.runAction(cc.sequence(cc.fadeOut(.3), cc.callFunc(function() {
e.blackbg.active = !1;
})));
d.default.resetAnimation(this.norBoardAnim, "bonusIn", -1);
n.default.Instance.resumeBgm(DocEnum.GameStageType.BONUS, !1);
return [ 2 ];
}
});
});
};
t.prototype.bonusGameEnd = function() {
return __awaiter(this, void 0, void 0, function() {
var e = this;
return __generator(this, function(t) {
switch (t.label) {
case 0:
this.blackbg.active = !0;
this.blackbg.opacity = 0;
this.blackbg.runAction(cc.fadeIn(.3));
l.default.Instance.playEffect("treegod_transition", !1);
d.default.playSpine(this.forestmanGuardian2, "transition", !1);
p.default.InstanceUnScale.addTimer(160 / 30, function() {
e.forestmanGuardian2.active = !1;
n.default.Instance.sendMsg2Fsm("bonusGameFinished");
});
return [ 4, p.default.InstanceUnScale.addTimerAsync(5) ];

case 1:
t.sent();
this.blackbg.runAction(cc.sequence(cc.fadeOut(.3), cc.callFunc(function() {
e.blackbg.active = !1;
})));
this.wheelView.node.active = !1;
d.default.resetAnimation(this.norBoardAnim, "bonusIn", 0);
return [ 2 ];
}
});
});
};
t.prototype.bonusGameOver = function() {
i.default.Instance.FeatureData.bonus_info = null;
n.default.Instance.pauseBgm(!1);
n.default.Instance.setBgmState(null);
n.default.Instance.resumeBgm(DocEnum.GameStageType.NORMAL, !1);
e.prototype.bonusGameOver.call(this);
};
__decorate([ _(cc.Node) ], t.prototype, "blackbg", void 0);
__decorate([ _(cc.Node) ], t.prototype, "forestmanGuardian2", void 0);
__decorate([ _(cc.Node) ], t.prototype, "norBoardAnim", void 0);
__decorate([ _(f.default) ], t.prototype, "wheelView", void 0);
return __decorate([ y ], t);
}(r.default);
o.default = m;
cc._RF.pop();
}, {
"../../../script/core-slots/base/SlotsBonusGame": void 0,
"../../../script/core-slots/driver/SlotsEnum": void 0,
"../../../script/core-slots/driver/SlotsGameDriver": void 0,
"../../../script/core-slots/driver/SlotsModel": void 0,
"../../../script/core-slots/line/SlotsLinePlayer": void 0,
"../../../script/core/audio-player/AudioPlayer": void 0,
"../../../script/core/event/EventDispatcher": void 0,
"../../../script/core/fx-player/FXPlayer": void 0,
"../../../script/core/timer/TimerMgr": void 0,
"../../../script/game/misc/ViewEventEnum": void 0,
"./TreegodWheelView": "TreegodWheelView"
} ],
TreegodCardView: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "ba7cbtkiNNG54tVmBb3K2IM", "TreegodCardView");
Object.defineProperty(o, "__esModule", {
value: !0
});
var r = e("../../../script/core-slots/reel/SlotsCardView"), a = e("../../../script/core/timer/TimerMgr"), n = cc._decorator, i = n.ccclass, s = (n.property, 
function(e) {
__extends(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
t.prototype.produceCardView = function(t) {
e.prototype.produceCardView.call(this, t);
this.winningAnimName = "finish";
};
t.prototype.setCollectFinish = function() {
this.cardId >= 7 && (this.winningAnimName = "finish2");
};
t.prototype.playStopBreath = function() {};
t.prototype.actCardSprite = function() {};
t.prototype.playStop = function(t) {
var o = this;
this.breathTimer = a.default.Instance.addTimer(.8, function() {
o.reelView.setCard2StopLayer(o, !0);
o.breathTimer = null;
o.playBreath(o.breathAnimName);
});
return e.prototype.playStop.call(this, t);
};
return __decorate([ i ], t);
}(r.default));
o.default = s;
cc._RF.pop();
}, {
"../../../script/core-slots/reel/SlotsCardView": void 0,
"../../../script/core/timer/TimerMgr": void 0
} ],
TreegodDataParser: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "6caf1rbKRdMXK9OEF6M5wDu", "TreegodDataParser");
Object.defineProperty(o, "__esModule", {
value: !0
});
var r = e("../../../script/core-slots/driver/SlotsDataParser"), a = e("../../../script/core-slots/driver/SlotsModel"), n = function(e) {
__extends(t, e);
function t() {
var t = e.call(this) || this;
t._reelMap4Cards = [ [ 0, 1, 2, 3, 4 ], [ 0, 1, 2, 3, 4 ], [ 0, 1, 2, 3, 4 ], [ 0, 1, 2, 3, 4 ], [ 0, 1, 2, 3, 4 ] ];
t._resultMap4Cards = [ [ 0, 0, 0, 0, 0 ], [ 1, 1, 1, 1, 1 ], [ 2, 2, 2, 2, 2 ], [ 3, 3, 3, 3, 3 ], [ 4, 4, 4, 4, 4 ] ];
t._resultLenArrays = [ [ 5 ] ];
t._reelMap4WinLine = [ [ 0, 0, 0, 0, 0 ], [ 1, 1, 1, 1, 1 ], [ 2, 2, 2, 2, 2 ], [ 3, 3, 3, 3, 3 ], [ 4, 4, 4, 4, 4 ] ];
t._resultMap4WinLine = [ [ 0, 1, 2, 3, 4 ], [ 0, 1, 2, 3, 4 ], [ 0, 1, 2, 3, 4 ], [ 0, 1, 2, 3, 4 ], [ 0, 1, 2, 3, 4 ] ];
return t;
}
t.prototype.dealRequestSlotsMachineInfo = function(t) {
a.default.Instance.CardsConf = {
1: {
id: 1,
len: 1,
zIndex: 30,
isSpine: !0,
type: DocEnum.SlotsMachineCardType.SCATTER,
res: "1",
layerName: "scatter",
lineCount: 1,
layerCount: 4,
animzIndex: 3
},
2: {
id: 2,
len: 1,
zIndex: 20,
isSpine: !0,
type: DocEnum.SlotsMachineCardType.BONUS,
res: "1",
layerName: "bonus",
lineCount: 1,
layerCount: 3,
animzIndex: 2
},
3: {
id: 3,
len: 1,
zIndex: 10,
isSpine: !0,
type: DocEnum.SlotsMachineCardType.WILD,
res: "3",
layerName: "wild",
lineCount: 1,
layerCount: 2,
animzIndex: 1
},
4: {
id: 4,
len: 1,
zIndex: 0,
isSpine: !0,
type: DocEnum.SlotsMachineCardType.NORMAL,
res: "4"
},
5: {
id: 5,
len: 1,
zIndex: 0,
isSpine: !0,
type: DocEnum.SlotsMachineCardType.NORMAL,
res: "5"
},
6: {
id: 6,
len: 1,
zIndex: 0,
isSpine: !0,
type: DocEnum.SlotsMachineCardType.NORMAL,
res: "6"
},
7: {
id: 7,
len: 1,
zIndex: 0,
isSpine: !0,
type: DocEnum.SlotsMachineCardType.NORMAL,
res: "7"
},
8: {
id: 8,
len: 1,
zIndex: 0,
isSpine: !0,
type: DocEnum.SlotsMachineCardType.NORMAL,
res: "8"
},
9: {
id: 9,
len: 1,
zIndex: 0,
isSpine: !0,
type: DocEnum.SlotsMachineCardType.NORMAL,
res: "9"
},
10: {
id: 10,
len: 1,
zIndex: 0,
isSpine: !0,
type: DocEnum.SlotsMachineCardType.NORMAL,
res: "10"
},
11: {
id: 11,
len: 1,
zIndex: 0,
isSpine: !0,
type: DocEnum.SlotsMachineCardType.NORMAL,
res: "11"
},
12: {
id: 12,
len: 1,
zIndex: 0,
isSpine: !0,
type: DocEnum.SlotsMachineCardType.NORMAL,
res: "12"
},
13: {
id: 13,
len: 1,
zIndex: 0,
isSpine: !0,
type: DocEnum.SlotsMachineCardType.NORMAL,
res: "13"
},
14: {
id: 14,
len: 1,
zIndex: 0,
isSpine: !0,
type: DocEnum.SlotsMachineCardType.NORMAL,
res: "14"
}
};
a.default.Instance.bet_bonus = t.init_result.features.all_bet_info || [];
e.prototype.dealRequestSlotsMachineInfo.call(this, t);
};
return t;
}(r.default);
o.default = n;
cc._RF.pop();
}, {
"../../../script/core-slots/driver/SlotsDataParser": void 0,
"../../../script/core-slots/driver/SlotsModel": void 0
} ],
TreegodFlyMoney: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "8d428a/tKNJU7hfcTsZIrm1", "TreegodFlyMoney");
Object.defineProperty(o, "__esModule", {
value: !0
});
var r = e("../../../script/core-slots/driver/SlotsGameState"), a = e("../../../script/core-slots/driver/SlotsModel"), n = e("../../../script/core/fx-player/FXPlayer"), i = e("../../../script/core/timer/TimerMgr"), s = e("../../../script/core/ui-ext/LabelScale"), l = e("../../../script/core/utils/CoreUtils"), c = cc._decorator, d = c.ccclass, p = c.property, u = function(e) {
__extends(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.sprite = null;
t.spine1 = null;
t.spine2 = null;
t.money = null;
t.jpParent = null;
t.jpNodes = new Array();
t._allChild = [];
t._mult = 0;
t._jpType = 0;
t.breathTimer = null;
return t;
}
t.prototype.onLoad = function() {
this._allChild = [];
for (var e = 0; e < this.node.children.length; e++) this._allChild.push(this.node.children[e]);
};
t.prototype.onDestroy = function() {
if (this.breathTimer) {
this.breathTimer.close(!1);
this.breathTimer = null;
}
};
t.prototype.playSpineBreath = function() {
this.sprite.active = !1;
n.default.playSpine(this.spine1, "breath", !0);
n.default.playSpine(this.spine2, "breath", !0);
};
t.prototype.playWinCollect = function() {
var e = this;
n.default.playSpine(this.spine1, "finish", !1);
n.default.playSpine(this.spine2, "finish", !1);
this.breathTimer = i.default.Instance.addTimer(2, function() {
e.breathTimer = null;
e.playSpineBreath();
});
};
t.prototype.playCollectMoney = function() {
var e = this;
if (this.breathTimer) {
this.breathTimer.close(!1);
this.breathTimer = null;
}
n.default.playSpine(this.spine1, "stop", !1);
n.default.playSpine(this.spine2, "stop", !1);
this.breathTimer = i.default.Instance.addTimer(20 / 30, function() {
e.breathTimer = null;
e.playSpineBreath();
});
};
t.prototype.getAllMoney = function() {
return this._mult;
};
t.prototype.getJpType = function() {
return this._jpType;
};
t.prototype.setFlyMoney = function(e, t) {
this._mult = e;
this._jpType = t;
this.sprite.active = !0;
this.spine1.active = !1;
this.spine2.active = !1;
this.money.node.active = !1;
for (var o = 0; o < this.jpNodes.length; o++) this.jpNodes[o].active = !1;
if (e > 0) {
var r = e * this.getCostMoney() / 100;
this.money.node.active = !0;
this.money.nowValue = l.default.abbreviateSegmentDigital(r, 4, 1);
if (t < 0) {
Math.abs(t) - 1 < this.jpNodes.length && (this.jpNodes[Math.abs(t) - 1].active = !0);
this.jpParent.y = 20;
this.money.node.y = -30;
}
} else t < 0 && Math.abs(t) - 1 < this.jpNodes.length && (this.jpNodes[Math.abs(t) - 1].active = !0);
};
t.prototype.getCostMoney = function() {
if (5 === r.SlotsGameState.Instance.currSlotStage) {
var e = a.default.Instance.FeatureData;
if (e.free_spin.is_super) return e.average_bet || 0;
}
return a.default.Instance.SlotsBetCoin;
};
__decorate([ p(cc.Node) ], t.prototype, "sprite", void 0);
__decorate([ p(cc.Node) ], t.prototype, "spine1", void 0);
__decorate([ p(cc.Node) ], t.prototype, "spine2", void 0);
__decorate([ p(s.default) ], t.prototype, "money", void 0);
__decorate([ p(cc.Node) ], t.prototype, "jpParent", void 0);
__decorate([ p(cc.Node) ], t.prototype, "jpNodes", void 0);
return __decorate([ d ], t);
}(cc.Component);
o.default = u;
cc._RF.pop();
}, {
"../../../script/core-slots/driver/SlotsGameState": void 0,
"../../../script/core-slots/driver/SlotsModel": void 0,
"../../../script/core/fx-player/FXPlayer": void 0,
"../../../script/core/timer/TimerMgr": void 0,
"../../../script/core/ui-ext/LabelScale": void 0,
"../../../script/core/utils/CoreUtils": void 0
} ],
TreegodFreeSpin: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "7a239PyoV5MUqH/OU1DjtaN", "TreegodFreeSpin");
Object.defineProperty(o, "__esModule", {
value: !0
});
var r = e("../../../script/core-slots/base/SlotsFreeSpin"), a = e("../../../script/core-slots/driver/SlotsEnum"), n = e("../../../script/core-slots/driver/SlotsGameDriver"), i = e("../../../script/core-slots/driver/SlotsJackpot"), s = e("../../../script/core-slots/driver/SlotsModel"), l = e("../../../script/core-slots/line/SlotsLinePlayer"), c = e("../../../script/core/audio-player/AudioPlayer"), d = e("../../../script/core/event/EventDispatcher"), p = e("../../../script/core/fx-player/FXPlayer"), u = e("../../../script/core/popup-mgr/PopupLayerView"), f = e("../../../script/core/popup-mgr/PopupMgr"), h = e("../../../script/core/timer/TimerMgr"), y = e("../../../script/game/misc/ViewEventEnum"), _ = e("../../../script/game/view/bars/SlotsBetView"), m = cc._decorator, v = m.ccclass, S = m.property, g = function(e) {
__extends(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.blackbg = null;
t.forestmanGuardian = null;
return t;
}
t.prototype.startSpin = function() {
var t = n.default.Instance.getSlotsLogic("SlotsSpinResult");
if (t._hasCollectMoney) {
t.clearFlyLock();
t._hasCollectMoney = !1;
}
n.default.Instance.getSlotsLogic("SlotsSingleSpin").startSpin();
e.prototype.startSpin.call(this);
};
t.prototype.initFsLock = function() {
var e = s.default.Instance.FeatureData.free_spin.fs_lock_info;
e && n.default.Instance.getSlotsLogic("SlotsSpinResult").resetLock(e.fs_all_lock, function() {});
};
t.prototype.prepareFreeSpin = function() {
return __awaiter(this, void 0, void 0, function() {
var t, o, r, a, l, c = this;
return __generator(this, function(p) {
switch (p.label) {
case 0:
t = s.default.Instance.FeatureData.free_spin;
o = s.default.Instance.FeatureData.average_bet || 0;
r = t.is_super;
n.default.Instance.pauseBgm(!1);
this._onRequestSpinResultParseFinish();
e.prototype.prepareFreeSpin.call(this);
d.default.Instance.sendEvent(y.ViewEventEnum.SlotsOperateBarDisableAll);
d.default.Instance.sendEvent(y.ViewEventEnum.DragBoxVisible, !1);
if (r) {
_.default.Instance.switchToAvgBetInfo();
i.default.Instance.switchAveragebet(!0, o);
}
this.initFsLock();
if (!(this.remainCount >= this.totalCount)) return [ 3, 2 ];
a = n.default.Instance.getSlotsLogic("SlotsSpinResult");
l = s.default.Instance.FeatureData;
return [ 4, a.addCollectNum(l.collect_count || 0) ];

case 1:
p.sent();
this.playManFsAudio();
f.default.Instance.pushViewByURL(u.PopupLayer.CONTENT, "res/prefab/TreegodFsStartPopupView", {
closeCallBack: function() {
n.default.Instance.resumeBgm(DocEnum.GameStageType.FREESPIN, !1);
c.prepareFreeSpinFinished();
},
data: {
addCount: t.add_lock_count,
is_super: r,
count: this.remainCount
}
}, s.default.Instance.machineBundleName);
return [ 3, 3 ];

case 2:
n.default.Instance.resumeBgm(DocEnum.GameStageType.FREESPIN, !1);
h.default.Instance.addTimer(2, function() {
c.prepareFreeSpinFinished();
});
h.default.Instance.addTimer(.5, function() {
c.playManFsAudio();
});
p.label = 3;

case 3:
return [ 2 ];
}
});
});
};
t.prototype.showCountAddition = function() {
var t = this, o = s.default.Instance.FeatureData.free_spin;
n.default.Instance.pauseBgm(!1);
if (l.default.Instance.showScatter(function() {
c.default.Instance.stopEffect(a.SlotsAudio.Bells);
t.playManFsAudio(!0);
f.default.Instance.pushViewByURL(u.PopupLayer.CONTENT, "res/prefab/TreegodFsStartPopupView", {
closeCallBack: function() {
n.default.Instance.resumeBgm(DocEnum.GameStageType.FREESPIN, !1);
e.prototype.showCountAddition.call(t);
},
data: {
addCount: o.add_lock_count,
is_super: !1,
isAdd: !0,
count: t.addCount
}
}, s.default.Instance.machineBundleName);
}) > 0) {
n.default.Instance.getSlotsLogic("SlotsSpinResult").playTreeFinish(!0);
c.default.Instance.playEffect(a.SlotsAudio.Bells);
}
};
t.prototype.showTotalPrize = function() {
var t = this, o = s.default.Instance.FeatureData, r = o.free_spin.is_super, a = n.default.Instance.getSlotsLogic("SlotsSpinResult");
n.default.Instance.pauseBgm(!1);
var l = "TreegodFsEndPopupView";
r && (l = "TreegodSuperFsEndPopupView");
f.default.Instance.pushViewByURL(u.PopupLayer.CONTENT, "res/prefab/" + l, {
closeCallBack: function() {
t.blackbg.active = !0;
t.blackbg.opacity = 0;
t.blackbg.runAction(cc.fadeIn(.3));
c.default.Instance.playEffect("treegod_transition", !1);
p.default.playSpine(t.forestmanGuardian, "transition", !1);
h.default.InstanceUnScale.addTimer(160 / 30, function() {
t.forestmanGuardian.active = !1;
d.default.Instance.sendEvent(y.ViewEventEnum.DragBoxVisible, !0);
n.default.Instance.resumeBgm(DocEnum.GameStageType.NORMAL, !1);
e.prototype.showTotalPrize.call(t);
});
h.default.InstanceUnScale.addTimer(5, function() {
t.blackbg.runAction(cc.sequence(cc.fadeOut(.3), cc.callFunc(function() {
t.blackbg.active = !1;
})));
a.resetLock(o.cur_bet_info.all_lock);
if (r) {
a.setCollectNum(0);
_.default.Instance.switchToNormalBetInfo();
i.default.Instance.switchAveragebet();
}
});
},
data: {
count: this.totalCount,
win: this.win
}
}, s.default.Instance.machineBundleName);
};
__decorate([ S(cc.Node) ], t.prototype, "blackbg", void 0);
__decorate([ S(cc.Node) ], t.prototype, "forestmanGuardian", void 0);
return __decorate([ v ], t);
}(r.default);
o.default = g;
cc._RF.pop();
}, {
"../../../script/core-slots/base/SlotsFreeSpin": void 0,
"../../../script/core-slots/driver/SlotsEnum": void 0,
"../../../script/core-slots/driver/SlotsGameDriver": void 0,
"../../../script/core-slots/driver/SlotsJackpot": void 0,
"../../../script/core-slots/driver/SlotsModel": void 0,
"../../../script/core-slots/line/SlotsLinePlayer": void 0,
"../../../script/core/audio-player/AudioPlayer": void 0,
"../../../script/core/event/EventDispatcher": void 0,
"../../../script/core/fx-player/FXPlayer": void 0,
"../../../script/core/popup-mgr/PopupLayerView": void 0,
"../../../script/core/popup-mgr/PopupMgr": void 0,
"../../../script/core/timer/TimerMgr": void 0,
"../../../script/game/misc/ViewEventEnum": void 0,
"../../../script/game/view/bars/SlotsBetView": void 0
} ],
TreegodFsEnd: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "fade1xEOVtL9KawXeR+F71B", "TreegodFsEnd");
Object.defineProperty(o, "__esModule", {
value: !0
});
var r = e("../../../script/core-slots/component/SlotsPopupBoardView"), a = e("../../../script/core/fx-player/FXPlayer"), n = e("../../../script/core/timer/TimerMgr"), i = cc._decorator, s = i.ccclass, l = i.property, c = function(e) {
__extends(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.spineBg = null;
t._breathTimer = null;
return t;
}
t.prototype.initWithData = function(t) {
var o = this;
a.default.playSpine(this.spineBg, "appear", !1);
this._breathTimer = n.default.Instance.addTimer(40 / 30, function() {
a.default.playSpine(o.spineBg, "breath", !0);
});
e.prototype.initWithData.call(this, t);
};
t.prototype._closeView = function(t) {
void 0 === t && (t = null);
if (this._breathTimer) {
this._breathTimer.close(!1);
this._breathTimer = null;
}
e.prototype._closeView.call(this, t);
};
__decorate([ l(cc.Node) ], t.prototype, "spineBg", void 0);
return __decorate([ s ], t);
}(r.default);
o.default = c;
cc._RF.pop();
}, {
"../../../script/core-slots/component/SlotsPopupBoardView": void 0,
"../../../script/core/fx-player/FXPlayer": void 0,
"../../../script/core/timer/TimerMgr": void 0
} ],
TreegodFsStart: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "8dab7t/dcBCXaCGpoe0iHW6", "TreegodFsStart");
Object.defineProperty(o, "__esModule", {
value: !0
});
var r = e("../../../script/core-slots/component/SlotsPopupBoardView"), a = e("../../../script/core/fx-player/FXPlayer"), n = e("../../../script/core/timer/TimerMgr"), i = cc._decorator, s = i.ccclass, l = i.property, c = function(e) {
__extends(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.spineBg = null;
t.superTxt = null;
t.addTxt = null;
t._breathTimer = null;
return t;
}
t.prototype.initWithData = function(t) {
var o = this, r = t.data.is_super, i = t.data.addCount || 0;
this.addTxt.string = "+" + i;
this.superTxt.active = r;
a.default.playSpine(this.spineBg, "appear", !1);
this._breathTimer = n.default.Instance.addTimer(40 / 30, function() {
a.default.playSpine(o.spineBg, "breath", !0);
});
e.prototype.initWithData.call(this, t);
};
t.prototype._closeView = function(t) {
void 0 === t && (t = null);
if (this._breathTimer) {
this._breathTimer.close(!1);
this._breathTimer = null;
}
e.prototype._closeView.call(this, t);
};
__decorate([ l(cc.Node) ], t.prototype, "spineBg", void 0);
__decorate([ l(cc.Node) ], t.prototype, "superTxt", void 0);
__decorate([ l(cc.Label) ], t.prototype, "addTxt", void 0);
return __decorate([ s ], t);
}(r.default);
o.default = c;
cc._RF.pop();
}, {
"../../../script/core-slots/component/SlotsPopupBoardView": void 0,
"../../../script/core/fx-player/FXPlayer": void 0,
"../../../script/core/timer/TimerMgr": void 0
} ],
TreegodFsm: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "3e686JB6g9ObZ0mUOo41NeP", "TreegodFsm");
Object.defineProperty(o, "__esModule", {
value: !0
});
o.default = {
init_machine_name: "SlotsRoot",
machines: {
SlotsRoot: {
transitions: [ {
from: {
name: "Init",
type: "Initial"
},
to: "Prepare"
}, {
from: "Prepare",
to: "UserSupport",
when: {
msg: "recoverGameBegin"
}
}, {
from: "UserSupport",
to: {
name: "CheckBonus",
type: "Choice"
},
when: {
msg: "userSupportEnd"
}
}, {
from: "CheckBonus",
to: "BonusGame",
when: {
func: "checkIfBonus"
}
}, {
from: "CheckBonus",
to: {
name: "CheckFreeSpin",
type: "Choice"
},
when: "else"
}, {
from: "BonusGame",
to: "UserSupportAfterBonus",
when: {
msg: "bonusGameEnd"
}
}, {
from: "UserSupportAfterBonus",
to: {
name: "CheckFreeSpin",
type: "Choice"
},
when: {
msg: "userSupportEnd"
}
}, {
from: "CheckFreeSpin",
to: "FreeSpin",
when: {
func: "checkIfFreeSpin"
}
}, {
from: "CheckFreeSpin",
to: {
name: "CheckAutoSpin",
type: "Choice"
},
when: "else"
}, {
from: "FreeSpin",
to: "UserSupportAfterFs",
when: {
msg: "freeSpinEnd"
}
}, {
from: "UserSupportAfterFs",
to: {
name: "CheckAutoSpin",
type: "Choice"
},
when: {
msg: "userSupportEnd"
}
}, {
from: "CheckAutoSpin",
to: {
name: "CheckMoney",
type: "Choice"
},
when: {
func: "checkIfAutoSpin"
}
}, {
from: "CheckAutoSpin",
to: "Idle",
when: "else"
}, {
from: "CheckMoney",
to: "SingleSpin",
when: {
func: "checkMoneyEnough"
}
}, {
from: "CheckMoney",
to: "ShowShortOfMoney",
when: "else"
}, {
from: "SingleSpin",
to: "UserSupport",
when: {
msg: "singleSpinEnd"
}
}, {
from: "ShowShortOfMoney",
to: "Idle",
when: {
msg: "showShortOfMoneyEnd"
}
}, {
from: "Idle",
to: "CheckMoney",
when: {
msg: "singleSpinBegin"
}
} ],
state_methods: {
Prepare: {
entry: [ "prepareGame" ]
},
UserSupport: {
entry: [ "userSupport" ]
},
UserSupportAfterBonus: {
entry: [ "userSupport" ]
},
UserSupportAfterFs: {
entry: [ "userSupport" ]
},
SingleSpin: {
entry: [ "startSpin" ]
},
ShowShortOfMoney: {
entry: [ "showShortOfMoney" ]
},
Idle: {
entry: [ "resetGame" ]
}
},
sub_machines: [ {
name: "SlotsSingleSpin",
parent_state_name: "SingleSpin",
type: "Machine"
}, {
name: "SlotsBonusGame",
parent_state_name: "BonusGame",
type: "Machine"
}, {
name: "SlotsFreeSpin",
parent_state_name: "FreeSpin",
type: "Machine"
} ]
},
SlotsBonusGame: {
transitions: [ {
from: {
name: "Init",
type: "Initial"
},
to: "prepareBonusGame"
}, {
from: "prepareBonusGame",
to: "playBonusGame",
when: {
msg: "prepareBonusGameFinished"
}
}, {
from: "playBonusGame",
to: "showTotalPrize",
when: {
msg: "bonusGameFinished"
}
}, {
from: "showTotalPrize",
to: "final",
when: {
msg: "showTotalPrizeFinished"
}
} ],
state_methods: {
prepareBonusGame: {
entry: [ "prepareBonusGame" ]
},
playBonusGame: {
entry: [ "playBonusGame" ]
},
showTotalPrize: {
entry: [ "showTotalPrize" ]
},
final: {
entry: [ "bonusGameOver" ]
}
}
},
SlotsSingleSpin: {
transitions: [ {
from: {
name: "Init",
type: "Initial"
},
to: "PrepareToStop"
}, {
from: "PrepareToStop",
to: "WaitEverySpin"
}, {
from: "WaitEverySpin",
to: "Stopping",
when: {
msg: "waitEverySpinFinish"
}
}, {
from: "Stopping",
to: "SpinResult",
when: {
msg: "allReelsStopped"
}
}, {
from: "SpinResult",
to: "Final",
when: {
msg: "spinResultEnd"
}
} ],
state_methods: {
WaitEverySpin: {
entry: [ "waitEverySpin" ]
},
Stopping: {
entry: [ "stopping" ]
},
Final: {
entry: [ "singleSpinOver" ]
}
},
sub_machines: [ {
name: "SlotsSpinResult",
parent_state_name: "SpinResult",
type: "Machine"
}, {
name: "RegionWaitNewLock",
parent_state_name: "PrepareToStop",
type: "Region"
}, {
name: "RegionWaitData",
parent_state_name: "PrepareToStop",
type: "Region"
}, {
name: "RegionStartReel",
parent_state_name: "PrepareToStop",
type: "Region"
} ]
},
RegionWaitNewLock: {
transitions: [ {
from: {
name: "Init",
type: "Initial"
},
to: "WaitNewLock"
}, {
from: "WaitNewLock",
to: "Final",
when: {
msg: "waitNewLockFinish"
}
} ]
},
RegionWaitData: {
transitions: [ {
from: {
name: "Init",
type: "Initial"
},
to: "WaitData"
}, {
from: "WaitData",
to: "Final",
when: {
msg: "spinResultDataReady"
}
} ]
},
RegionStartReel: {
transitions: [ {
from: {
name: "Init",
type: "Initial"
},
to: "WaitStartReel"
}, {
from: "WaitStartReel",
to: "Final",
when: {
msg: "allReelsStarted"
}
} ]
},
SlotsFreeSpin: {
transitions: [ {
from: {
name: "Init",
type: "Initial"
},
to: "PrepareFreeSpin"
}, {
from: "PrepareFreeSpin",
to: {
name: "CheckFreeSpin",
type: "Choice"
},
when: {
msg: "prepareFreeSpinFinished"
}
}, {
from: "CheckFreeSpin",
to: "SingleSpin",
when: {
func: "checkCountRemain"
}
}, {
from: "CheckFreeSpin",
to: "ShowTotalPrize",
when: "else"
}, {
from: "SingleSpin",
to: "UserSupport",
when: {
msg: "singleSpinEnd"
}
}, {
from: "UserSupport",
to: "SettleRemainCount",
when: {
msg: "userSupportEnd"
}
}, {
from: "ShowTotalPrize",
to: "Final",
when: {
msg: "showTotalPrizeFinished"
}
}, {
from: "SettleRemainCount",
to: {
name: "CheckAddCount",
type: "Choice"
},
when: {
msg: "settleRemainCountFinished"
}
}, {
from: "CheckAddCount",
to: "ShowCountAddition",
when: {
func: "checkCountAddition"
}
}, {
from: "CheckAddCount",
to: "CheckFreeSpin",
when: "else"
}, {
from: "ShowCountAddition",
to: "CheckFreeSpin",
when: {
msg: "showCountAdditionFinished"
}
} ],
state_methods: {
PrepareFreeSpin: {
entry: [ "prepareFreeSpin" ]
},
SingleSpin: {
entry: [ "startSpin" ]
},
SettleRemainCount: {
entry: [ "settleRemainCount" ]
},
ShowTotalPrize: {
entry: [ "showTotalPrize" ]
},
ShowCountAddition: {
entry: [ "showCountAddition" ]
},
UserSupport: {
entry: [ "userSupport" ]
},
Final: {
entry: [ "freeSpinOver" ]
}
},
sub_machines: [ {
name: "SlotsSingleSpin",
parent_state_name: "SingleSpin",
type: "Machine"
} ]
},
SlotsSpinResult: {
transitions: [ {
from: {
name: "Init",
type: "Initial"
},
to: "PrepareOneResult"
}, {
from: "PrepareOneResult",
to: {
name: "CheckIfCollect",
type: "Choice"
},
when: {
msg: "prepareOneResultFinished"
}
}, {
from: "CheckIfCollect",
to: "ShowCollect",
when: {
func: "checkIfCollect"
}
}, {
from: "CheckIfCollect",
to: "ShowResult",
when: "else"
}, {
from: "ShowCollect",
to: "ShowResult",
when: {
msg: "showCollectFinished"
}
}, {
from: "ShowResult",
to: "Final"
} ],
state_methods: {
PrepareOneResult: {
entry: [ "prepareOneResult" ]
},
ShowCollect: {
entry: [ "onShowCollect" ]
},
Final: {
entry: [ "spinResultOver" ]
}
},
sub_machines: [ {
name: "RegionShowPrize",
parent_state_name: "ShowResult",
type: "Region"
}, {
name: "RegionShowLines",
parent_state_name: "ShowResult",
type: "Region"
} ]
},
RegionShowPrize: {
transitions: [ {
from: {
name: "Init",
type: "Initial"
},
to: {
name: "CheckBigPrize",
type: "Choice"
}
}, {
from: "CheckBigPrize",
to: "ShowBigPrize",
when: {
func: "checkBigPrize"
}
}, {
from: "CheckBigPrize",
to: "ShowNormalPrize",
when: "else"
}, {
from: "ShowBigPrize",
to: "Final",
when: {
msg: "showBigPrizeFinished"
}
}, {
from: "ShowNormalPrize",
to: "Final",
when: {
msg: "showNormalPrizeFinished"
}
} ],
state_methods: {
ShowBigPrize: {
entry: [ "showBigPrize" ]
},
ShowNormalPrize: {
entry: [ "showNormalPrize" ]
}
}
},
RegionShowLines: {
transitions: [ {
from: {
name: "Init",
type: "Initial"
},
to: "ShowLines"
}, {
from: "ShowLines",
to: "Final",
when: {
msg: "showLinesFinished"
}
} ],
state_methods: {
ShowLines: {
entry: [ "showLines" ]
}
}
}
}
};
cc._RF.pop();
}, {} ],
TreegodJackpotView: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "dc04a6WJ2RBdbh6kGIkPZrE", "TreegodJackpotView");
Object.defineProperty(o, "__esModule", {
value: !0
});
var r = e("../../../script/core-slots/component/SlotsPopupBoardView"), a = e("../../../script/core/fx-player/FXPlayer"), n = e("../../../script/core/timer/TimerMgr"), i = cc._decorator, s = i.ccclass, l = i.property, c = function(e) {
__extends(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.doubleX = null;
t.collect = null;
t.ok = null;
t.spineBg = null;
t._breathTimer = null;
return t;
}
t.prototype.initWithData = function(t) {
var o = this, r = t.data.isCollect;
this.doubleX && (this.doubleX.string = t.data.jpNum || 1);
this.collect.active = !1;
this.ok.active = !1;
if (r) {
this.collect.active = !0;
this.isCollectDone = r;
this.collectType = DocEnum.CollectType.BONUS;
} else this.ok.active = !0;
var i = t.data.jpType;
this.spineBg.active = !0;
a.default.setSpineSkin(this.spineBg, [ "mini", "minor", "major", "grand" ][i - 1]);
a.default.playSpine(this.spineBg, "appear", !1);
this._breathTimer = n.default.Instance.addTimer(40 / 30, function() {
a.default.playSpine(o.spineBg, "breath", !0);
});
e.prototype.initWithData.call(this, t);
};
t.prototype._closeView = function(t) {
void 0 === t && (t = null);
if (this._breathTimer) {
this._breathTimer.close(!1);
this._breathTimer = null;
}
e.prototype._closeView.call(this, t);
};
__decorate([ l(cc.Label) ], t.prototype, "doubleX", void 0);
__decorate([ l(cc.Node) ], t.prototype, "collect", void 0);
__decorate([ l(cc.Node) ], t.prototype, "ok", void 0);
__decorate([ l(cc.Node) ], t.prototype, "spineBg", void 0);
return __decorate([ s ], t);
}(r.default);
o.default = c;
cc._RF.pop();
}, {
"../../../script/core-slots/component/SlotsPopupBoardView": void 0,
"../../../script/core/fx-player/FXPlayer": void 0,
"../../../script/core/timer/TimerMgr": void 0
} ],
TreegodLockPrefab: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "3dcebvWHRxBNIFp5NKXC4we", "TreegodLockPrefab");
Object.defineProperty(o, "__esModule", {
value: !0
});
var r = e("../../../script/core/fx-player/FXPlayer"), a = e("../../../script/core/timer/TimerMgr"), n = cc._decorator, i = n.ccclass, s = n.property, l = function(e) {
__extends(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.kuangSpine = null;
t.effSpine1 = null;
t.effSpine2 = null;
t.moveSpine = null;
t._allChild = [];
t._breathTimer = null;
return t;
}
t.prototype.onLoad = function() {
this._allChild = [];
this._allChild.push(this.kuangSpine);
this._allChild.push(this.effSpine2);
this._allChild.push(this.effSpine1);
this._allChild.push(this.moveSpine);
};
t.prototype.closeBreathTimer = function() {
if (this._breathTimer) {
this._breathTimer.close(!1);
this._breathTimer = null;
}
};
t.prototype.playNextMove = function(e) {
return __awaiter(this, void 0, void 0, function() {
var t = this;
return __generator(this, function(o) {
switch (o.label) {
case 0:
r.default.playSpine(this.moveSpine, "finish", !0);
return [ 4, a.default.Instance.addTimerAsync(52 / 30) ];

case 1:
o.sent();
r.default.playSpine(this.moveSpine, e, !0);
return [ 4, a.default.Instance.addTimerAsync(20 / 30) ];

case 2:
o.sent();
a.default.Instance.addTimer(.9, function() {
t.moveSpine.active = !1;
});
return [ 2 ];
}
});
});
};
t.prototype.resetChild = function() {
this.closeBreathTimer();
for (var e = 0; e < this._allChild.length; e++) {
var t = this._allChild[e];
t.parent = this.node;
t.setPosition(cc.v2(0, 0));
}
};
t.prototype.playLockBefore = function() {
this.closeBreathTimer();
this.kuangSpine.active = !1;
this.effSpine1.active = !1;
r.default.playSpine(this.effSpine2, "breath", !0);
};
t.prototype.playActLockBefore = function(e) {
void 0 === e && (e = !1);
this.effSpine2.active = e;
};
t.prototype.playLockBreath = function() {
this.closeBreathTimer();
r.default.playSpine(this.kuangSpine, "breath", !0);
r.default.playSpine(this.effSpine2, "breath", !0);
r.default.playSpine(this.effSpine1, "breath", !0);
};
t.prototype.playLockAppear = function() {
var e = this;
this.closeBreathTimer();
r.default.playSpine(this.kuangSpine, "appear", !1);
r.default.playSpine(this.effSpine1, "appear", !1);
r.default.playSpine(this.effSpine2, "appear", !1);
this._breathTimer = a.default.Instance.addTimer(70 / 30, function() {
e.playLockBreath();
});
};
t.prototype.playLockFinish = function() {
var e = this;
this.closeBreathTimer();
r.default.playSpine(this.kuangSpine, "finish", !1);
r.default.playSpine(this.effSpine1, "finish", !1);
r.default.playSpine(this.effSpine2, "finish", !1);
this._breathTimer = a.default.Instance.addTimer(1, function() {
e.playLockBreath();
});
};
__decorate([ s(cc.Node) ], t.prototype, "kuangSpine", void 0);
__decorate([ s(cc.Node) ], t.prototype, "effSpine1", void 0);
__decorate([ s(cc.Node) ], t.prototype, "effSpine2", void 0);
__decorate([ s(cc.Node) ], t.prototype, "moveSpine", void 0);
return __decorate([ i ], t);
}(cc.Component);
o.default = l;
cc._RF.pop();
}, {
"../../../script/core/fx-player/FXPlayer": void 0,
"../../../script/core/timer/TimerMgr": void 0
} ],
TreegodRoot: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "47cdaIRzONKNJ30CKzfxhmw", "TreegodRoot");
Object.defineProperty(o, "__esModule", {
value: !0
});
var r = e("../../../script/core-slots/base/SlotsRoot"), a = e("../../../script/core-slots/driver/SlotsGameDriver"), n = e("../../../script/core-slots/driver/SlotsModel"), i = e("../../../script/core/event/EventDispatcher"), s = e("../../../script/core/utils/CreatorUtils"), l = e("../../../script/game/misc/ViewEventEnum"), c = cc._decorator, d = c.ccclass, p = c.property, u = function(e) {
__extends(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.touchBtn = null;
t.spineArray = new Array();
t._reEnterGame = !1;
return t;
}
t.prototype.onLoad = function() {
for (var t = 0; t < this.spineArray.length; t++) s.default.addTimeUnScale(this.spineArray[t].name, !1);
i.default.Instance.addObserver("BetChanged", this, this.onBetChanged);
i.default.Instance.addObserver("RequestSlotsMachineInfoParseFinish", this, this._onSMInfoParseCompleted);
i.default.Instance.addObserver("RequestSpinResultParseFinish", this, this._onSpinResultParseCompleted);
e.prototype.onLoad.call(this);
};
t.prototype.onDestroy = function() {
for (var t = 0; t < this.spineArray.length; t++) s.default.delTimeUnScale(this.spineArray[t].name);
i.default.Instance.removeObserver("BetChanged", this);
i.default.Instance.removeObserver("RequestSlotsMachineInfoParseFinish", this);
i.default.Instance.removeObserver("RequestSpinResultParseFinish", this);
e.prototype.onDestroy.call(this);
};
t.prototype._onSMInfoParseCompleted = function() {
this._reEnterGame = !0;
};
t.prototype._onSpinResultParseCompleted = function() {
this._reEnterGame = !1;
};
t.prototype.startSpin = function() {
n.default.Instance.FeatureData;
var t = a.default.Instance.getSlotsLogic("SlotsSpinResult");
if (t._hasCollectMoney) {
t.clearFlyLock();
t._hasCollectMoney = !1;
}
a.default.Instance.getSlotsLogic("SlotsSingleSpin").startSpin();
e.prototype.startSpin.call(this);
};
t.prototype.onBetChanged = function() {
var e = this;
this.touchBtn.active = !0;
i.default.Instance.sendEvent(l.ViewEventEnum.SlotsOperateBarDisableAll);
var t = this.getCurBetInfoLock(), o = n.default.Instance.SlotsBetCoinInRecord;
a.default.Instance.getSlotsLogic("SlotsSpinResult").resetLock(t, function() {
e.touchBtn.active = !1;
n.default.Instance.FeatureData.cur_bet_info = {
bets: o,
all_lock: t
};
i.default.Instance.sendEvent(l.ViewEventEnum.SlotsOperateBarEnableAll);
});
};
t.prototype.updateBetInfoCollect = function(e) {
var t = n.default.Instance.bet_bonus;
t = t || [];
for (var o = !1, r = 0; r < t.length; r++) {
var a = t[r];
if (a.bets === e.bets) {
a.all_lock = e.all_lock;
o = !0;
break;
}
}
o || n.default.Instance.bet_bonus.push({
bets: e.bets,
all_lock: e.all_lock
});
};
t.prototype.getCurBetInfoLock = function() {
var e = n.default.Instance.bet_bonus;
e = e || [];
for (var t = n.default.Instance.SlotsBetCoinInRecord, o = [ [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ] ], r = 0; r < e.length; r++) {
var a = e[r];
if (a.bets === t) {
o = a.all_lock;
break;
}
}
return o;
};
t.prototype.checkIfBonus = function() {
return !!n.default.Instance.FeatureData.bonus_info;
};
__decorate([ p(cc.Node) ], t.prototype, "touchBtn", void 0);
__decorate([ p(cc.Node) ], t.prototype, "spineArray", void 0);
return __decorate([ d ], t);
}(r.default);
o.default = u;
cc._RF.pop();
}, {
"../../../script/core-slots/base/SlotsRoot": void 0,
"../../../script/core-slots/driver/SlotsGameDriver": void 0,
"../../../script/core-slots/driver/SlotsModel": void 0,
"../../../script/core/event/EventDispatcher": void 0,
"../../../script/core/utils/CreatorUtils": void 0,
"../../../script/game/misc/ViewEventEnum": void 0
} ],
TreegodSingleSpin: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "6bc07izjpRL0rjwicdXQLaY", "TreegodSingleSpin");
Object.defineProperty(o, "__esModule", {
value: !0
});
var r = e("../../../script/core-slots/base/SlotsSingleSpin"), a = e("../../../script/core-slots/driver/SlotsGameDriver"), n = e("../../../script/core-slots/driver/SlotsModel"), i = e("../../../script/core-slots/reel/SlotsChessBoardManager"), s = e("../../../script/core/audio-player/AudioPlayer"), l = cc._decorator, c = l.ccclass, d = l.property, p = {
reel_stop: 0,
treegod_number_1: 1,
treegod_number_2: 2,
treegod_number_3: 3,
treegod_number_4: 4,
treegod_number_5: 5,
treegod_scater_1: 16,
treegod_scater_2: 17,
treegod_scater_3: 18,
treegod_scater_4: 19,
treegod_scater_5: 20
}, u = function(e) {
__extends(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.maskBlackBg = null;
t._maskBlackBg = [];
t._stopAudioMap = {};
t._scatterAudioCnt = 0;
t._jpAudioCnt = 0;
return t;
}
t.prototype.onLoad = function() {
this._maskBlackBg = [];
for (var t = 0; t < this.maskBlackBg.children.length; t++) this._maskBlackBg.push(this.maskBlackBg.children[t]);
e.prototype.onLoad.call(this);
};
t.prototype.allBlackIn = function() {
for (var e = 0; e < this._maskBlackBg.length; e++) {
this._maskBlackBg[e].stopAllActions();
this._maskBlackBg[e].runAction(cc.fadeTo(.3, 120));
}
};
t.prototype.allBlackOut = function(e) {
void 0 === e && (e = -1);
if (-1 === e) for (var t = 0; t < this._maskBlackBg.length; t++) {
this._maskBlackBg[t].stopAllActions();
this._maskBlackBg[t].runAction(cc.fadeOut(.2));
} else {
this._maskBlackBg[e].stopAllActions();
this._maskBlackBg[e].runAction(cc.fadeOut(.2));
}
};
t.prototype.onReelHoldStart = function(t, o) {
a.default.Instance.getSlotsLogic("SlotsSpinResult").playTreeGodStartHold();
e.prototype.onReelHoldStart.call(this, t, o);
};
t.prototype.onReelHoldStop = function(t, o) {
var r = i.default.Instance.getChessBoard(o), n = r.getReel(t);
4 === t && n.holdWinInfo.isHoldWin ? a.default.Instance.getSlotsLogic("SlotsSpinResult").playTreeGodEndHold() : t < 4 && n.holdWinInfo.isHoldWin && (r.getReel(t + 1).holdWinInfo.isHoldWin || a.default.Instance.getSlotsLogic("SlotsSpinResult").playTreeGodEndHold());
e.prototype.onReelHoldStop.call(this, t, o);
};
t.prototype.startSpin = function() {
return __awaiter(this, void 0, void 0, function() {
return __generator(this, function(e) {
switch (e.label) {
case 0:
this.allBlackIn();
this._stopAudioMap = {};
this._scatterAudioCnt = 0;
this._jpAudioCnt = 0;
return [ 4, a.default.Instance.getSlotsLogic("SlotsSpinResult").waitNewLock() ];

case 1:
e.sent();
return [ 2 ];
}
});
});
};
t.prototype.waitEverySpin = function() {
return __awaiter(this, void 0, void 0, function() {
return __generator(this, function(e) {
switch (e.label) {
case 0:
return 5 !== n.default.Instance.GameStage.cur_game_stage ? [ 3, 2 ] : [ 4, a.default.Instance.getSlotsLogic("SlotsSpinResult").waitEverySpin() ];

case 1:
e.sent();
e.label = 2;

case 2:
a.default.Instance.sendMsg2Fsm("waitEverySpinFinish");
return [ 2 ];
}
});
});
};
t.prototype.onSingleReelStopAlmost = function(e) {
var t = a.default.Instance.getSlotsLogic("SlotsSpinResult");
5 === n.default.Instance.GameStage.cur_game_stage ? t.addFsNewLockBefore(e) : t.addNewLockBefore(e);
this.allBlackOut(e);
var o = e + 1;
if (null == this._stopAudioMap[o]) {
var r = "reel_stop";
this._stopAudioMap[o] = 1;
var l = 5;
e % 2 == 0 && (l = 4);
for (var c = 0; c < l; c++) {
var d = i.default.Instance.getDisplayCardByResultIdx(0, e, c).cardId, u = this.getStopAudio(d, o);
p[u] > p[r] && (r = u);
}
s.default.Instance.playEffect(r, !1);
}
};
t.prototype.getStopAudio = function(e, t) {
var o = "reel_stop";
1 === e ? o = "treegod_scater_" + t : 2 === e && (o = "treegod_number_" + t);
return o;
};
__decorate([ d(cc.Node) ], t.prototype, "maskBlackBg", void 0);
return __decorate([ c ], t);
}(r.default);
o.default = u;
cc._RF.pop();
}, {
"../../../script/core-slots/base/SlotsSingleSpin": void 0,
"../../../script/core-slots/driver/SlotsGameDriver": void 0,
"../../../script/core-slots/driver/SlotsModel": void 0,
"../../../script/core-slots/reel/SlotsChessBoardManager": void 0,
"../../../script/core/audio-player/AudioPlayer": void 0
} ],
TreegodSpinResult: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "1e36csiLx1LDZPHC91rk8pY", "TreegodSpinResult");
Object.defineProperty(o, "__esModule", {
value: !0
});
var r = e("../../../script/core-slots/base/SlotsSpinResult"), a = e("../../../script/core-slots/driver/SlotsGameDriver"), n = e("../../../script/core-slots/driver/SlotsGameState"), i = e("../../../script/core-slots/driver/SlotsJackpot"), s = e("../../../script/core-slots/driver/SlotsModel"), l = e("../../../script/core-slots/line/SlotsLinePlayer"), c = e("../../../script/core-slots/reel/SlotsChessBoardManager"), d = e("../../../script/core/audio-player/AudioPlayer"), p = e("../../../script/core/ease/gsap/CustomEase"), u = e("../../../script/core/event/EventDispatcher"), f = e("../../../script/core/fx-player/FXPlayer"), h = e("../../../script/core/popup-mgr/PopupLayerView"), y = e("../../../script/core/popup-mgr/PopupMgr"), _ = e("../../../script/core/timer/TimerMgr"), m = e("../../../script/core/utils/CoreUtils"), v = e("../../../script/core/utils/CreatorUtils"), S = e("../../../script/game/view/bars/SlotsCoinRewardView"), g = cc._decorator, I = g.ccclass, w = g.property, T = function(e) {
__extends(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.jpParent = null;
t.collect1 = null;
t.collect2 = null;
t.treeSpine = null;
t.jpEff = new Array();
t.lockLayer = null;
t.lockPrefab = null;
t.randomLayer = null;
t.randomPrefab = null;
t.shakeAnim = null;
t.flyMoneyLayer = null;
t.flyMoneyPrefab = null;
t.blastPrefab = null;
t.blastPrefab2 = null;
t.blastLayer = null;
t.blastCollectPrefab = null;
t.addMoneyPrefab = null;
t._collect1 = [];
t._collect2 = [];
t._hasCollectMoney = !1;
t._flyTag = {};
t._lock_posX = [ -390, -195, 0, 195, 390 ];
t._lock_posY = [ [ 288, 384, 288, 384, 288 ], [ 96, 192, 96, 192, 96 ], [ -96, 0, -96, 0, -96 ], [ -288, -192, -288, -192, -288 ], [ 0, -384, 0, -384, 0 ] ];
t._allLockNode = {};
t._allMoneyCollectNode = {};
t._startHold = !1;
t._breathTimer = null;
t._needAddNew = !1;
t._lockBefore = {};
t._winJpNum = [ 0, 0, 0, 0 ];
t._curCollectNum = 0;
return t;
}
t.prototype.onLoad = function() {
this._allLockNode = {};
this._needAddNew = !1;
this._lockBefore = {};
this._collect1 = [];
this._collect2 = [];
for (var t = 0; t < this.collect1.children.length; t++) {
this._collect1.push(this.collect1.children[t]);
this._collect2.push(this.collect2.children[t]);
}
u.default.Instance.addObserver("RequestSlotsMachineInfoParseFinish", this, this._onRequestSlotsMachineInfoParseFinish);
e.prototype.onLoad.call(this);
};
t.prototype.onDestroy = function() {
u.default.Instance.removeObserver("RequestSlotsMachineInfoParseFinish", this);
e.prototype.onDestroy.call(this);
};
t.prototype.playAnimJpOut = function() {
this.jpParent.stopAllActions();
this.jpParent.runAction(cc.fadeOut(.3));
};
t.prototype.playAnimJpIn = function() {
this.jpParent.stopAllActions();
this.jpParent.runAction(cc.fadeIn(.3));
};
t.prototype.prepareOneResult = function() {
var t = this, o = 0;
"holdwin_win" === f.default.getSpine(this.treeSpine).animation && (o = 85 / 30 - f.default.getSpineAnimationLast(this.treeSpine));
o > 0 ? _.default.InstanceUnScale.addTimer(o, function() {
e.prototype.prepareOneResult.call(t);
}) : e.prototype.prepareOneResult.call(this);
};
t.prototype._onRequestSlotsMachineInfoParseFinish = function() {
this._needAddNew = !1;
var e = s.default.Instance.FeatureData, t = e.collect_count || 0;
if (t > 0 && a.default.Instance.getSlotsLogic("SlotsRoot").checkIfBonus()) {
var o = s.default.Instance.FeatureData.bonus_info;
o.wheel_cfg[o.pos].jp_type <= 0 && (t -= 1);
}
this.setCollectNum(t);
this.resetLock(e.cur_bet_info.all_lock);
this.playBreath();
};
t.prototype.onSpinResultReady = function() {
this._needAddNew = !0;
var t = s.default.Instance.FeatureData;
a.default.Instance.getSlotsLogic("SlotsRoot").updateBetInfoCollect(t.cur_bet_info);
e.prototype.onSpinResultReady.call(this);
};
t.prototype.setCollectNum = function(e) {
this._curCollectNum = e;
for (var t = 0; t < this._collect1.length; t++) if (t < e) {
f.default.playSpine(this._collect1[t], "breath", !0);
f.default.playSpine(this._collect2[t], "breath", !0);
} else {
this._collect1[t].active = !1;
this._collect2[t].active = !1;
}
};
t.prototype.addCollectNum = function(e) {
return __awaiter(this, void 0, void 0, function() {
var t, o = this;
return __generator(this, function(r) {
switch (r.label) {
case 0:
if (e <= this._curCollectNum) return [ 2 ];
this._curCollectNum = e;
for (t = 0; t < this._collect1.length; t++) if (t <= e - 1 && !this._collect1[e - 1].active) {
d.default.Instance.playEffect("treegod_liang", !1);
f.default.playSpine(this._collect1[e - 1], "appear", !1);
f.default.playSpine(this._collect2[e - 1], "appear", !1);
_.default.Instance.addTimer(25 / 30, function() {
f.default.playSpine(o._collect1[e - 1], "breath", !0);
f.default.playSpine(o._collect2[e - 1], "breath", !0);
});
}
return [ 4, _.default.Instance.addTimerAsync(25 / 30) ];

case 1:
r.sent();
return [ 2 ];
}
});
});
};
t.prototype.closeBreathTimer = function() {
if (this._breathTimer) {
this._breathTimer.close(!1);
this._breathTimer = null;
}
};
t.prototype.playBreath = function() {
f.default.playSpine(this.treeSpine, "breath", !0);
};
t.prototype.setMix = function(e, t) {
void 0 === t && (t = .1);
f.default.setSpineMix(this.treeSpine, e, t);
};
t.prototype.isPlayingBreath = function() {
return "breath" === f.default.getSpine(this.treeSpine).animation;
};
t.prototype.playTreeFinish = function(e) {
var t = this;
void 0 === e && (e = !1);
if (e || this.isPlayingBreath()) {
this.closeBreathTimer();
var o = Math.floor(3 * Math.random());
o = Math.min(o, 2);
var r = [ "win1", "win2", "win3", "win3" ];
this.setMix(r[o]);
f.default.playSpine(this.treeSpine, r[o], !1);
this._breathTimer = _.default.InstanceUnScale.addTimer([ 50 / 30, 70 / 30, 70 / 30, 70 / 30 ][o], function() {
t.playBreath();
});
d.default.Instance.playEffect([ "treegod_win1", "treegod_win2", "treegod_win3", "treegod_win3" ][o], !1);
}
};
t.prototype.playStartTreeGodAddLock = function() {
var e = this;
d.default.Instance.playEffect("treegod_holdwin_start", !1);
this.playAnimJpOut();
this.closeBreathTimer();
this.setMix("holdwin_start");
f.default.playSpine(this.treeSpine, "holdwin_start", !1);
this._breathTimer = _.default.InstanceUnScale.addTimer(1.5, function() {
f.default.playSpine(e.treeSpine, "holdwin_loop2", !0);
});
};
t.prototype.playEndTreeGodAddLock = function() {
var e = this;
d.default.Instance.playEffect("treegod_holdwin_lose", !1);
this.closeBreathTimer();
this.setMix("holdwin_lose");
f.default.playSpine(this.treeSpine, "holdwin_lose", !1);
this._breathTimer = _.default.InstanceUnScale.addTimer(38 / 30, function() {
e.playBreath();
});
_.default.InstanceUnScale.addTimer(1, function() {
e.playAnimJpIn();
});
};
t.prototype.playTreeGodStartHold = function() {
var e = this;
if (!this._startHold) {
this._startHold = !0;
d.default.Instance.playEffect("treegod_holdwin_start", !1);
this.playAnimJpOut();
this.closeBreathTimer();
this.setMix("holdwin_start");
f.default.playSpine(this.treeSpine, "holdwin_start", !1);
this._breathTimer = _.default.InstanceUnScale.addTimer(1.5, function() {
f.default.playSpine(e.treeSpine, "holdwin_loop", !0);
});
}
};
t.prototype.playTreeGodEndHold = function() {
var e = this;
if (this._startHold) {
this._startHold = !1;
this.closeBreathTimer();
var t = !1, o = "holdwin_lose", r = 38 / 30;
if (a.default.Instance.getSlotsLogic("SlotsRoot").checkIfBonus()) {
t = !0;
o = "holdwin_win";
r = 85 / 30;
}
t ? d.default.Instance.playEffect("treegod_holdwin_win", !1) : d.default.Instance.playEffect("treegod_holdwin_lose", !1);
this.setMix(o);
f.default.playSpine(this.treeSpine, o, !1);
this._breathTimer = _.default.InstanceUnScale.addTimer(r, function() {
e.playBreath();
});
_.default.InstanceUnScale.addTimer(t ? 2.5 : 1, function() {
e.playAnimJpIn();
});
}
};
t.prototype.showJpEff = function(e, t) {
void 0 === t && (t = !0);
this.jpEff[e - 1].active = t;
};
t.prototype.showNormalPrize = function(t) {
void 0 === t && (t = 0);
var o = s.default.Instance.FeatureData.all_collect_money || 0;
if (o > 0 && this.winMoney >= o) {
t = o;
var r = s.default.Instance.SlotsBetCoin, a = s.default.Instance.BaseData.voiceBet;
this.showDuration = l.default.Instance.getSmallTime(this.winMoney - o, r, a, this.prizeType);
}
e.prototype.showNormalPrize.call(this, t);
};
t.prototype.showLines = function() {
var t = s.default.Instance.FeatureData.all_collect_money || 0;
(this.winMoney - t > 0 || this.checkBigPrize()) && this.playTreeFinish();
e.prototype.showLines.call(this);
};
t.prototype.clearFlyLock = function() {
for (var e = 0; e < 5; e++) for (var t = 0; t < 5; t++) {
var o = c.default.Instance.getTopDisplayCardByResultIdx(0, e, t);
o && 2 === o.cardId && o.cardView.actCardSprite();
}
v.default.destroyNode(this.flyMoneyLayer, !1);
for (var r in this._flyTag) if (this._allLockNode[r]) {
this._allLockNode[r].lockNode.getComponent("TreegodLockPrefab").resetChild();
v.default.destroyNode(this._allLockNode[r].lockNode);
this._allLockNode[r] = null;
}
this._flyTag = {};
};
t.prototype.resetLock = function(e, t) {
void 0 === t && (t = null);
if (c.default.Instance.getChessBoard(0).getReel(0).reelModel) {
l.default.Instance.stopShowLines();
for (var o = 0; o < 5; o++) for (var r = 0; r < 5; r++) {
var a = c.default.Instance.getTopDisplayCardByResultIdx(0, o, r);
a && 2 === a.cardId && a.cardView.actCardSprite();
}
this._needAddNew = !1;
this._hasCollectMoney = !1;
this._flyTag = {};
v.default.destroyNode(this.flyMoneyLayer, !1);
for (var n in this._lockBefore) if (this._lockBefore[n]) {
(i = this._lockBefore[n]).resetChild();
v.default.destroyNode(i.node);
}
this._lockBefore = {};
for (var n in this._allLockNode) if (this._allLockNode[n]) {
var i;
(i = this._allLockNode[n].lockNode.getComponent("TreegodLockPrefab")).resetChild();
v.default.destroyNode(this._allLockNode[n].lockNode);
}
this._allLockNode = {};
for (r = 0; r < e.length; r++) for (o = 0; o < e[r].length; o++) e[r][o] > 0 && this.addLockNode(o, r);
t && t();
} else t();
};
t.prototype.waitNewLock = function() {
return __awaiter(this, void 0, void 0, function() {
return __generator(this, function(e) {
switch (e.label) {
case 0:
this._winJpNum = [ 0, 0, 0, 0 ];
return this._needAddNew && this.checkAddNewLock() ? 5 !== s.default.Instance.GameStage.cur_game_stage ? [ 3, 2 ] : [ 4, this.addFsSpinNewLock() ] : [ 3, 5 ];

case 1:
e.sent();
return [ 3, 4 ];

case 2:
return [ 4, this.addSpinNewLock() ];

case 3:
e.sent();
e.label = 4;

case 4:
this._lockBefore = {};
a.default.Instance.sendMsg2Fsm("waitNewLockFinish");
return [ 3, 6 ];

case 5:
this._lockBefore = {};
a.default.Instance.sendMsg2Fsm("waitNewLockFinish");
e.label = 6;

case 6:
return [ 2 ];
}
});
});
};
t.prototype.checkFsAddNewLock = function() {
return (s.default.Instance.FeatureData.free_spin.fs_lock_info.fs_next_add_lock || []).length > 0;
};
t.prototype.checkAddNewLock = function() {
if (5 === s.default.Instance.GameStage.cur_game_stage) return this.checkFsAddNewLock();
for (var e = s.default.Instance.FeatureData.next_add_lock || [ [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ] ], t = 0; t < e.length; t++) for (var o = 0; o < e[t].length; o++) if (e[t][o] > 0) return !0;
return !1;
};
t.prototype.checkIfCollect = function() {
for (var e = s.default.Instance.FeatureData, t = e.win_moneys || [ [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ] ], o = 0; o < t.length; o++) for (var r = 0; r < t[o].length; r++) if (t[o][r] > 0) return !0;
var a = e.win_jp_types || [ [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ] ];
for (o = 0; o < a.length; o++) for (r = 0; r < a[o].length; r++) if (a[o][r] > 0) return !0;
return !1;
};
t.prototype.onShowCollect = function() {
return __awaiter(this, void 0, void 0, function() {
return __generator(this, function(e) {
switch (e.label) {
case 0:
return [ 4, this.playFlyToMaxMoneyCard() ];

case 1:
e.sent();
return [ 2 ];
}
});
});
};
t.prototype.addLockNode = function(e, t) {
if (!this._allLockNode[e + "" + t]) {
var o = cc.v2(this._lock_posX[e], this._lock_posY[t][e]), r = v.default.getStencilNode(this.lockPrefab, this.lockLayer, o), a = r.getComponent("TreegodLockPrefab");
v.default.drawCallChangeNodeLayer(this.lockLayer, a._allChild);
a.playLockBreath();
var n = {
reelIdx: e,
resultIdx: t,
lockNode: r
};
this._allLockNode[e + "" + t] = n;
}
};
t.prototype.addFsNewLockBefore = function(e) {
for (var t = s.default.Instance.FeatureData.free_spin.fs_lock_info.fs_next_add_lock || [], o = 0; o < t.length; o++) {
var r = t[o], a = r.reel_idx, n = r.result_idx;
if (e === a && !this._allLockNode[a + "" + n] && !this._lockBefore[a + "" + n]) {
var i = cc.v2(this._lock_posX[a], this._lock_posY[n][a]), l = v.default.getStencilNode(this.lockPrefab, this.lockLayer, i).getComponent("TreegodLockPrefab");
v.default.drawCallChangeNodeLayer(this.lockLayer, l._allChild);
l.playLockBefore();
this._lockBefore[a + "" + n] = l;
}
}
};
t.prototype.playShakeAnim = function() {
f.default.playAnimation(this.shakeAnim, "shakeAnim", cc.WrapMode.Normal);
};
t.prototype.getRandomDirection = function(e, t) {
var o = e.reelIdx, r = e.resultIdx, a = t.reelIdx, n = t.resultIdx, i = 5;
o % 2 == 0 && (i = 4);
return "move" + (o === a ? n > r ? 5 : 1 : o < a ? 4 === i ? n > r ? 6 : 8 : n >= r ? 6 : 8 : 4 === i ? n > r ? 4 : 2 : n >= r ? 4 : 2);
};
t.prototype.waitEverySpin = function() {
return __awaiter(this, void 0, void 0, function() {
var e, t, o, r, a, n, i, l, c, u = this;
return __generator(this, function(h) {
switch (h.label) {
case 0:
e = [];
t = s.default.Instance.FeatureData.free_spin.fs_lock_info;
o = t.every_spin_add_lock || [];
for (r = 0; r < o.length; r++) for (a = 0; a < o[r].length; a++) if (o[r][a] > 0 && !this._allLockNode[a + "" + r]) {
n = {
reelIdx: a,
resultIdx: r
};
e.push(n);
}
if (!(e.length > 0)) return [ 3, 6 ];
e.sort(function() {
return Math.random() - .5;
});
d.default.Instance.playEffectWithNoSame("treegod_jinkuang_fly", !1);
this.randomPrefab.active = !0;
this.randomPrefab.setPosition(cc.v2(0, 0));
this.randomPrefab.scale = 0;
TweenLite.to(this.randomPrefab, .4, {
onComplete: function() {},
ease: p.default.create("custom", "M0,0,C0,0,1,1,1,1"),
scale: 4.5
});
this.playStartTreeGodAddLock();
return [ 4, _.default.Instance.addTimerAsync(10 / 30) ];

case 1:
h.sent();
i = function(t) {
var o, r, a, n;
return __generator(this, function(i) {
switch (i.label) {
case 0:
o = e[t].reelIdx;
r = e[t].resultIdx;
a = cc.v2(l._lock_posX[o], l._lock_posY[r][o]);
TweenLite.to(l.randomPrefab, .2, {
onComplete: function() {},
ease: p.default.create("custom", "M0,0,C0,0,1,1,1,1"),
x: a.x,
y: a.y
});
TweenLite.to(l.randomPrefab, .2, {
onComplete: function() {},
ease: p.default.create("custom", "M0,0,C0.46,0,0.496,0.014,0.616,0.088,0.734,0.161,0.884,0.4,1,1"),
scale: 1
});
return [ 4, _.default.Instance.addTimerAsync(.2) ];

case 1:
i.sent();
l.playShakeAnim();
n = v.default.getStencilNode(l.blastPrefab2, l.randomLayer, cc.v2(a.x, a.y));
f.default.playSpine(n, "appear", !1);
_.default.Instance.addTimer(25 / 30, function() {
v.default.destroyNode(n);
});
t === e.length - 1 && _.default.Instance.addTimer(.2, function() {
u.randomPrefab.active = !1;
});
return [ 4, _.default.Instance.addTimerAsync(10 / 30) ];

case 2:
i.sent();
l.addLockNode(o, r);
return [ 4, _.default.Instance.addTimerAsync(10 / 30) ];

case 3:
i.sent();
if (t === e.length - 1) return [ 2, "continue" ];
d.default.Instance.playEffectWithNoSame("treegod_jinkuang_fly", !1);
TweenLite.to(l.randomPrefab, 10 / 30, {
onComplete: function() {},
ease: p.default.create("custom", "M0,0,C0,0,1,1,1,1"),
x: 0,
y: 0
});
TweenLite.to(l.randomPrefab, 10 / 30, {
onComplete: function() {},
ease: p.default.create("custom", "M0,0,C0,0,1,1,1,1"),
scale: 4.5
});
return [ 4, _.default.Instance.addTimerAsync(10 / 30) ];

case 4:
i.sent();
return [ 2 ];
}
});
};
l = this;
c = 0;
h.label = 2;

case 2:
return c < e.length ? [ 5, i(c) ] : [ 3, 5 ];

case 3:
h.sent();
h.label = 4;

case 4:
c++;
return [ 3, 2 ];

case 5:
this.playEndTreeGodAddLock();
h.label = 6;

case 6:
return [ 2 ];
}
});
});
};
t.prototype.addNewLockBefore = function(e) {
for (var t = s.default.Instance.FeatureData.next_add_lock || [ [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ] ], o = 0; o < t.length; o++) if (t[o][e] > 0 && !this._allLockNode[e + "" + o] && !this._lockBefore[e + "" + o]) {
var r = cc.v2(this._lock_posX[e], this._lock_posY[o][e]), a = v.default.getStencilNode(this.lockPrefab, this.lockLayer, r).getComponent("TreegodLockPrefab");
v.default.drawCallChangeNodeLayer(this.lockLayer, a._allChild);
a.playLockBefore();
this._lockBefore[e + "" + o] = a;
}
};
t.prototype.addFsSpinNewLock = function() {
return __awaiter(this, void 0, void 0, function() {
var e, t, o, r, a, n, i, l, c, p, u, f, h = this;
return __generator(this, function(y) {
switch (y.label) {
case 0:
e = s.default.Instance.FeatureData.free_spin.fs_lock_info;
t = e.fs_next_add_lock || [];
o = !1;
_.default.Instance.addTimer(25 / 30, function() {
d.default.Instance.playEffectWithNoSame("treegod_goldkuang_liang", !1);
});
for (f = 0; f < t.length; f++) {
r = t[f];
a = r.reel_idx;
n = r.result_idx;
if (this._lockBefore[a + "" + n]) {
(i = this._lockBefore[a + "" + n]).playLockAppear();
l = {
reelIdx: a,
resultIdx: n,
lockNode: i.node
};
this._allLockNode[a + "" + n] = l;
}
r.super_random && (this._allLockNode[r.super_random.reelIdx + "" + r.super_random.resultIdx] || (o = !0));
}
return t.length > 0 && o ? [ 4, _.default.Instance.addTimerAsync(50 / 30) ] : [ 3, 3 ];

case 1:
y.sent();
c = 0;
p = function(e) {
var o = t[e], r = o.reel_idx, a = o.result_idx;
if (o.super_random) {
var n = o.super_random.reel_idx, i = o.super_random.result_idx;
if (!u._allLockNode[n + "" + i]) {
var s = u._allLockNode[r + "" + a];
if (s) {
c = 2.4;
s = s.lockNode.getComponent("TreegodLockPrefab");
var l = u.getRandomDirection({
reelIdx: r,
resultIdx: a
}, {
reelIdx: n,
resultIdx: i
});
s.playNextMove(l);
}
_.default.Instance.addTimer(c, function() {
var e = cc.v2(h._lock_posX[n], h._lock_posY[i][n]), t = v.default.getStencilNode(h.lockPrefab, h.lockLayer, e).getComponent("TreegodLockPrefab");
v.default.drawCallChangeNodeLayer(h.lockLayer, t._allChild);
t.playLockAppear();
var o = {
reelIdx: n,
resultIdx: i,
lockNode: t.node
};
h._allLockNode[n + "" + i] = o;
});
}
}
};
u = this;
for (f = 0; f < t.length; f++) p(f);
c > 0 && _.default.Instance.addTimer(c + 25 / 30, function() {
d.default.Instance.playEffectWithNoSame("treegod_goldkuang_liang", !1);
});
return [ 4, _.default.Instance.addTimerAsync(1.7 + c) ];

case 2:
y.sent();
return [ 3, 5 ];

case 3:
return t.length > 0 ? [ 4, _.default.Instance.addTimerAsync(50 / 30) ] : [ 3, 5 ];

case 4:
y.sent();
y.label = 5;

case 5:
return [ 2 ];
}
});
});
};
t.prototype.addSpinNewLock = function() {
return __awaiter(this, void 0, void 0, function() {
var e, t, o, r, a, n;
return __generator(this, function(i) {
switch (i.label) {
case 0:
e = s.default.Instance.FeatureData;
t = e.next_add_lock || [ [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ] ];
_.default.Instance.addTimer(25 / 30, function() {
d.default.Instance.playEffectWithNoSame("treegod_goldkuang_liang", !1);
});
for (o = 0; o < t.length; o++) for (r = 0; r < t[o].length; r++) if (t[o][r] > 0 && this._lockBefore[r + "" + o]) {
(a = this._lockBefore[r + "" + o]).playLockAppear();
n = {
reelIdx: r,
resultIdx: o,
lockNode: a.node
};
this._allLockNode[r + "" + o] = n;
}
return [ 4, _.default.Instance.addTimerAsync(1.7) ];

case 1:
i.sent();
return [ 2 ];
}
});
});
};
t.prototype.getAroundPos = function(e, t) {
var o = 5;
e % 2 == 0 && (o = 4);
var r = [];
if (e - 1 >= 0) if (4 === o) {
r.push({
reelIdx: e - 1,
resultIdx: t
});
r.push({
reelIdx: e - 1,
resultIdx: t + 1
});
} else {
t < 4 && r.push({
reelIdx: e - 1,
resultIdx: t
});
t - 1 >= 0 && r.push({
reelIdx: e - 1,
resultIdx: t - 1
});
}
if (e + 1 < 5) if (4 === o) {
r.push({
reelIdx: e + 1,
resultIdx: t
});
r.push({
reelIdx: e + 1,
resultIdx: t + 1
});
} else {
t < 4 && r.push({
reelIdx: e + 1,
resultIdx: t
});
t - 1 >= 0 && r.push({
reelIdx: e + 1,
resultIdx: t - 1
});
}
t - 1 >= 0 && r.push({
reelIdx: e,
resultIdx: t - 1
});
t + 1 < o && r.push({
reelIdx: e,
resultIdx: t + 1
});
return r;
};
t.prototype.playFlyToMaxMoneyCard = function() {
return __awaiter(this, void 0, void 0, function() {
var e, t, o, r, n, i, s, l, u, h, y, m, S, g, I, w, T, b, k, C, N, M = this;
return __generator(this, function(B) {
switch (B.label) {
case 0:
e = 20;
this._allMoneyCollectNode = {};
t = [];
o = [];
r = [];
for (n = 0; n < 5; n++) {
i = 5;
n % 2 == 0 && (i = 4);
for (s = 0; s < i; s++) if ((l = c.default.Instance.getDisplayCardByResultIdx(0, n, s)) && 2 === l.cardView.cardId) {
o.push(l.cardView);
if (this._allLockNode[n + "" + s]) {
t.push(l.cardView);
r.push({
reelIdx: n,
resultIdx: s
});
}
}
}
u = [];
(h = function() {
if (!(r.length <= 0)) {
for (var e = r.shift(), t = M.getAroundCard(e), o = 0; o < t.length; o++) for (var a = t[o], n = 0; n < r.length; n++) if (a.reelIdx === r[n].reelIdx && a.resultIdx === r[n].resultIdx) {
r.splice(n, 1);
break;
}
u.push(t);
h();
}
})();
y = .01;
m = [];
S = [];
g = function(t) {
for (var o = u[t], r = [], a = 0, n = null, i = null, s = 0; s < o.length; s++) {
var l = o[s], d = c.default.Instance.getDisplayCardByResultIdx(0, l.reelIdx, l.resultIdx);
if (d && 2 === d.cardView.cardId) {
var p = d.cardView.getMoney();
if (p < 0) {
if (p < a) {
n = d.cardView;
i = {
reelIdx: l.reelIdx,
resultIdx: l.resultIdx
};
}
a = Math.min(p, a);
} else if (a >= 0) {
if (p > a) {
n = d.cardView;
i = {
reelIdx: l.reelIdx,
resultIdx: l.resultIdx
};
}
a = Math.max(p, a);
}
r.push(d.cardView);
}
}
if (!n) return "continue";
I._allMoneyCollectNode[i.reelIdx + "" + i.resultIdx] = n;
m.push(i);
var f = n.getMoney(), h = {
mult: 0,
jpType: 0
};
f >= 0 ? h.mult += f : h.jpType = Math.min(h.jpType, f);
var g = n.node.convertToWorldSpaceAR(cc.v2(0, 0));
g = I.flyMoneyLayer.convertToNodeSpaceAR(g);
var w = function(t) {
var o = r[t].getMoney();
if (r[t] !== n) {
o >= 0 ? h.mult += o : h.jpType = Math.min(h.jpType, o);
y = 1.5;
var a = r[t].node.convertToWorldSpaceAR(cc.v2(0, 0));
a = I.flyMoneyLayer.convertToNodeSpaceAR(a);
var i = cc.v2(Math.abs(g.x - a.x) / 3, Math.abs(g.y - a.y) / 2);
Math.abs(g.y - a.y) < 1 && (i.y = i.x);
Math.abs(g.x - a.x) < 1 && (i.x = i.y);
var s = cc.v2(a.x + i.x, a.y + i.y);
g.x - a.x < -1 && (s = cc.v2(a.x - i.x, a.y + i.y));
if (g.y >= a.y) {
s.y = g.y + i.y;
s.x = g.x + i.x;
g.x - a.x > 1 && (s.x = g.x - i.x);
}
var l = cc.bezierTo(.5, [ cc.v2(a.x, a.y), s, g ]);
r[t].inactiveView();
var c = v.default.getStencilNode(I.flyMoneyPrefab, I.flyMoneyLayer, a);
c.zIndex = e;
e += 5;
c.getComponent("TreegodFlyMoney").setFlyMoney(o >= 0 ? o : 0, o < 0 ? o : 0);
c.runAction(cc.sequence(l, cc.callFunc(function() {
_.default.Instance.addTimer(8 / 30, function() {
n.addMoney(o);
});
v.default.destroyNode(c);
})));
}
};
for (s = 0; s < r.length; s++) w(s);
S.push(h);
};
I = this;
for (w = 0; w < u.length; w++) g(w);
if (m.length <= 0) {
a.default.Instance.sendMsg2Fsm("showCollectFinished");
return [ 2 ];
}
d.default.Instance.playEffectWithNoSame("treegod_number_fly", !1);
a.default.Instance.getSlotsLogic("SlotsSingleSpin").allBlackIn();
T = 0;
y > .01 ? T = .42 : y = .22;
_.default.Instance.addTimer(T, function() {
for (var t = function(t) {
var o = cc.v2(M._lock_posX[m[t].reelIdx], M._lock_posY[m[t].resultIdx][m[t].reelIdx]), r = v.default.getStencilNode(M.blastPrefab, M.blastLayer, o);
r.zIndex = e;
e += 5;
f.default.playSpine(r, "appear", !1);
_.default.Instance.addTimer(20 / 30, function() {
v.default.destroyNode(r);
});
}, o = 0; o < m.length; o++) t(o);
0 !== T && d.default.Instance.playEffectWithNoSame("treegod_number_fly_collect", !1);
});
return [ 4, _.default.Instance.addTimerAsync(y) ];

case 1:
B.sent();
this._hasCollectMoney = !0;
this._flyTag = {};
b = function(t, o, r, a) {
void 0 === r && (r = null);
return __awaiter(M, void 0, void 0, function() {
var n, i, s, l, c, u, h, y = this;
return __generator(this, function() {
n = this.getAroundPos(t, o);
i = [];
for (h = 0; h < n.length; h++) {
s = n[h];
if (this._allLockNode[s.reelIdx + "" + s.resultIdx] && !this._flyTag[s.reelIdx + "" + s.resultIdx]) {
this._flyTag[s.reelIdx + "" + s.resultIdx] = 1;
i.push({
reelIdx: s.reelIdx,
resultIdx: s.resultIdx
});
}
}
if (i.length <= 0) {
r && r();
return [ 2 ];
}
if (i.length > 0) {
l = cc.v2(this._lock_posX[t], this._lock_posY[o][t]);
c = function(t) {
var o = cc.v2(u._lock_posX[i[t].reelIdx], u._lock_posY[i[t].resultIdx][i[t].reelIdx]), r = v.default.getStencilNode(u.flyMoneyPrefab, u.flyMoneyLayer, l);
r.zIndex = e;
e += 5;
var n = r.getComponent("TreegodFlyMoney");
u._allMoneyCollectNode[i[t].reelIdx + "" + i[t].resultIdx] = n;
n.setFlyMoney(a.mult, a.jpType);
var s = !1, c = !1;
TweenLite.to(r, .4, {
onComplete: function() {
if ((s = !0) && c) {
s = !1;
c = !1;
v.default.drawCallChangeNodeLayer(y.flyMoneyLayer, n._allChild);
}
},
ease: p.default.create("custom", "M0,0,C0,0,1,1,1,1"),
x: o.x
});
var d = "M0,0 C0,0 0.12,-0.5 0.3,-0.5 0.448,-0.5 0.59,-0.132 0.625,-0.058 0.974,0.679 1,1 1,1";
o.x !== l.x && (d = "M0,0 C0,0 0.048,-1.066 0.44,-1.066 0.984,-1.066 1,1 1,1");
if (o.y > l.y) {
d = "M0,0 C0,0 0.05,0.242 0.09,0.395 0.12,0.512 0.139,0.578 0.18,0.69 0.211,0.776 0.25,0.89 0.262,0.92 0.28,0.962 0.434,1.426 0.604,1.426 0.754,1.426 0.79,1.066 0.895,1.018 0.96,0.988 1,1 1,1";
o.x !== l.x && (d = "M0,0 C0,0 0.11,2.153 0.418,2.142 0.678,2.132 1,1 1,1");
}
TweenLite.to(r, .4, {
onComplete: function() {
c = !0;
if (s && c) {
s = !1;
c = !1;
v.default.drawCallChangeNodeLayer(y.flyMoneyLayer, n._allChild);
}
},
ease: p.default.create("custom", d),
y: o.y
});
_.default.Instance.addTimer(.28, function() {
var t = v.default.getStencilNode(y.blastPrefab2, y.blastLayer, cc.v2(o.x, o.y));
t.zIndex = e;
e += 5;
f.default.playSpine(t, "appear", !1);
_.default.Instance.addTimer(25 / 30, function() {
v.default.destroyNode(t);
});
_.default.Instance.addTimer(10 / 30, function() {
n.playSpineBreath();
});
});
};
u = this;
for (h = 0; h < i.length; h++) c(h);
d.default.Instance.playEffectWithNoSame("treegod_number_jump", !1);
_.default.Instance.addTimer(.3, function() {
d.default.Instance.playEffectWithNoSame("treegod_number_jump_collect", !1);
});
_.default.Instance.addTimer(.6, function() {
for (var e = 0, t = 0; t < i.length; t++) b(i[t].reelIdx, i[t].resultIdx, function() {
e += 1;
i.length === e && r && r();
}, a);
});
}
return [ 2 ];
});
});
};
k = 0;
for (C = 0; C < m.length; C++) {
N = m[C];
this._flyTag[N.reelIdx + "" + N.resultIdx] = 1;
b(N.reelIdx, N.resultIdx, function() {
k += 1;
m.length === k && M.collectMoneyToWin();
}, S[C]);
}
return [ 2 ];
}
});
});
};
t.prototype.collectMoneyToWin = function() {
return __awaiter(this, void 0, void 0, function() {
var e, t, o, r, n, s, l;
return __generator(this, function(p) {
switch (p.label) {
case 0:
return [ 4, _.default.Instance.addTimerAsync(.5) ];

case 1:
p.sent();
d.default.Instance.playEffect("treegod_number_show", !1);
for (e = 0; e < 5; e++) for (t = 0; t < 5; t++) {
if (this._lockBefore[e + "" + t]) {
this._lockBefore[e + "" + t].playActLockBefore();
(s = c.default.Instance.getDisplayCardByResultIdx(0, e, t)) && 2 === s.cardView.cardId && s.cardView.getReelView().setCard2InitLayer(s.cardView);
}
(o = this._allMoneyCollectNode[e + "" + t]) && o.playWinCollect();
}
return [ 4, _.default.Instance.addTimerAsync(2) ];

case 2:
p.sent();
return [ 4, this.collectMoneyAnim() ];

case 3:
p.sent();
for (r in this._flyTag) if (this._allLockNode[r]) {
n = this._allLockNode[r];
(s = c.default.Instance.getDisplayCardByResultIdx(0, n.reelIdx, n.resultIdx)) && s.cardView.setCollectFinish();
}
for (l = 0; l < this._winJpNum.length; l++) this._winJpNum[l] > 0 && i.default.Instance.resetJackpot(l, !0);
return [ 4, _.default.Instance.addTimerAsync(.5) ];

case 4:
p.sent();
a.default.Instance.sendMsg2Fsm("showCollectFinished");
return [ 2 ];
}
});
});
};
t.prototype.getCostMoney = function() {
if (5 === n.SlotsGameState.Instance.currSlotStage) {
var e = s.default.Instance.FeatureData;
if (e.free_spin.is_super) return e.average_bet || 0;
}
return s.default.Instance.SlotsBetCoin;
};
t.prototype.getJpWinMoney = function(e) {
for (var t = s.default.Instance.FeatureData.win_jp_money || [], o = 0; o < t.length; o++) if (t[o].jp_type === e) return t[o].jp_money;
return 0;
};
t.prototype.flyMoney = function(e, t, o) {
return __awaiter(this, void 0, void 0, function() {
var r, a, n, i, s, l, c, p, u, g = this;
return __generator(this, function(I) {
switch (I.label) {
case 0:
d.default.Instance.playEffectWithNoSame("treegod_number_shouji", !1);
r = y.default.Instance.getLayer(h.PopupLayer.UIHIGH).node;
a = S.default.Instance.node.convertToWorldSpaceAR(cc.v2(0, -5));
a = r.convertToNodeSpaceAR(a);
n = e.node.convertToWorldSpaceAR(cc.v2(0, 0));
n = r.convertToNodeSpaceAR(n);
i = e.node.convertToWorldSpaceAR(cc.v2(0, 0));
i = this.blastLayer.convertToNodeSpaceAR(i);
s = v.default.getStencilNode(this.blastPrefab, this.blastLayer, i);
f.default.playSpine(s, "appear", !1);
_.default.Instance.addTimer(20 / 30, function() {
v.default.destroyNode(s);
});
e.playCollectMoney();
l = 0;
c = 0;
t > 0 && (l = t * this.getCostMoney() / 100);
if (o < 0) {
this._winJpNum[Math.abs(o) - 1] = this._winJpNum[Math.abs(o) - 1] + 1;
this.showJpEff(Math.abs(o));
c = this.getJpWinMoney(Math.abs(o));
l += c;
}
return [ 4, _.default.Instance.addTimerAsync(8 / 30) ];

case 1:
I.sent();
p = v.default.getStencilNode(this.addMoneyPrefab, r, a);
u = Math.floor(l);
p.children[0].children[0].getComponent("LabelScale").nowValue = "+" + m.default.insertCommaToNumber(u);
f.default.playAnimation(p.children[0], "getMoney", cc.WrapMode.Normal);
_.default.Instance.addTimer(.7, function() {
v.default.destroyNode(p);
});
_.default.Instance.addTimer(.5, function() {
d.default.Instance.playEffectWithNoSame("treegod_zhangqian", !1);
var e = v.default.getStencilNode(g.blastCollectPrefab, r, a);
f.default.playSpine(e, "finish", !1);
_.default.Instance.addTimer(17 / 30, function() {
v.default.destroyNode(e);
});
_.default.Instance.addTimer(.1, function() {
S.default.Instance.addMoney(l, .6);
});
});
return o < 0 ? [ 4, _.default.Instance.addTimerAsync(16 / 30) ] : [ 3, 3 ];

case 2:
I.sent();
return [ 3, 5 ];

case 3:
return [ 4, _.default.Instance.addTimerAsync(16 / 30) ];

case 4:
I.sent();
I.label = 5;

case 5:
return [ 2 ];
}
});
});
};
t.prototype.showJpView = function(e) {
return __awaiter(this, void 0, void 0, function() {
var t, o, r = this;
return __generator(this, function() {
if ((t = this._winJpNum[Math.abs(e) - 1]) <= 0) return [ 2 ];
o = this.getJpWinMoney(Math.abs(e)) * t;
_.default.Instance.addTimer(1, function() {
r.showJpEff(Math.abs(e), !1);
});
return [ 2, new Promise(function(a) {
var n = "TreegodJackpotView";
t > 1 && (n = "TreegodAllJackpotView");
y.default.Instance.pushViewByURL(h.PopupLayer.CONTENT, "res/prefab/" + n, {
didShowCallBack: function() {},
closeCallBack: function() {
return __awaiter(r, void 0, void 0, function() {
return __generator(this, function(e) {
switch (e.label) {
case 0:
return [ 4, _.default.Instance.addTimerAsync(2 / 30) ];

case 1:
e.sent();
a();
return [ 2 ];
}
});
});
},
data: {
jpNum: t,
isCollect: !1,
jpType: Math.abs(e),
win: o
}
}, s.default.Instance.machineBundleName);
}) ];
});
});
};
t.prototype.collectMoneyAnim = function() {
return __awaiter(this, void 0, void 0, function() {
var e, t, o, r, n, i;
return __generator(this, function(s) {
switch (s.label) {
case 0:
r = 0;
s.label = 1;

case 1:
if (!(r < 5)) return [ 3, 6 ];
n = 0;
s.label = 2;

case 2:
return n < 5 ? (e = this._allMoneyCollectNode[r + "" + n]) ? [ 4, this.flyMoney(e, e.getAllMoney(), e.getJpType()) ] : [ 3, 4 ] : [ 3, 5 ];

case 3:
s.sent();
s.label = 4;

case 4:
n++;
return [ 3, 2 ];

case 5:
r++;
return [ 3, 1 ];

case 6:
t = !1;
for (o = 0; o < this._winJpNum.length; o++) this._winJpNum[o] > 0 && (t = !0);
if (!t) return [ 3, 10 ];
o = 0;
s.label = 7;

case 7:
return o < this._winJpNum.length ? this._winJpNum[o] > 0 ? [ 4, this.showJpView(o + 1) ] : [ 3, 9 ] : [ 3, 10 ];

case 8:
s.sent();
s.label = 9;

case 9:
o++;
return [ 3, 7 ];

case 10:
a.default.Instance.getSlotsLogic("SlotsSingleSpin").allBlackOut();
for (r = 0; r < 5; r++) for (n = 0; n < 5; n++) if (this._lockBefore[r + "" + n]) {
this._lockBefore[r + "" + n].playActLockBefore(!0);
(i = c.default.Instance.getDisplayCardByResultIdx(0, r, n)) && 2 === i.cardView.cardId && i.cardView.playStopBreath();
}
return [ 4, _.default.Instance.addTimerAsync(10 / 30) ];

case 11:
s.sent();
return [ 2 ];
}
});
});
};
t.prototype.getAroundCard = function(e) {
var t = this, o = {};
o[e.reelIdx + "" + e.resultIdx] = 1;
var r = [];
r.push({
reelIdx: e.reelIdx,
resultIdx: e.resultIdx
});
var a = function(e, n) {
for (var i = t.getAroundPos(e, n), s = [], l = 0; l < i.length; l++) {
var c = i[l];
if (t._allLockNode[c.reelIdx + "" + c.resultIdx] && !o[c.reelIdx + "" + c.resultIdx]) {
o[c.reelIdx + "" + c.resultIdx] = 1;
s.push({
reelIdx: c.reelIdx,
resultIdx: c.resultIdx
});
r.push({
reelIdx: c.reelIdx,
resultIdx: c.resultIdx
});
}
}
if (!(s.length <= 0)) for (l = 0; l < s.length; l++) a(s[l].reelIdx, s[l].resultIdx);
};
a(e.reelIdx, e.resultIdx);
return r;
};
__decorate([ w(cc.Node) ], t.prototype, "jpParent", void 0);
__decorate([ w(cc.Node) ], t.prototype, "collect1", void 0);
__decorate([ w(cc.Node) ], t.prototype, "collect2", void 0);
__decorate([ w(cc.Node) ], t.prototype, "treeSpine", void 0);
__decorate([ w(cc.Node) ], t.prototype, "jpEff", void 0);
__decorate([ w(cc.Node) ], t.prototype, "lockLayer", void 0);
__decorate([ w(cc.Node) ], t.prototype, "lockPrefab", void 0);
__decorate([ w(cc.Node) ], t.prototype, "randomLayer", void 0);
__decorate([ w(cc.Node) ], t.prototype, "randomPrefab", void 0);
__decorate([ w(cc.Node) ], t.prototype, "shakeAnim", void 0);
__decorate([ w(cc.Node) ], t.prototype, "flyMoneyLayer", void 0);
__decorate([ w(cc.Node) ], t.prototype, "flyMoneyPrefab", void 0);
__decorate([ w(cc.Node) ], t.prototype, "blastPrefab", void 0);
__decorate([ w(cc.Node) ], t.prototype, "blastPrefab2", void 0);
__decorate([ w(cc.Node) ], t.prototype, "blastLayer", void 0);
__decorate([ w(cc.Node) ], t.prototype, "blastCollectPrefab", void 0);
__decorate([ w(cc.Node) ], t.prototype, "addMoneyPrefab", void 0);
return __decorate([ I ], t);
}(r.default);
o.default = T;
cc._RF.pop();
}, {
"../../../script/core-slots/base/SlotsSpinResult": void 0,
"../../../script/core-slots/driver/SlotsGameDriver": void 0,
"../../../script/core-slots/driver/SlotsGameState": void 0,
"../../../script/core-slots/driver/SlotsJackpot": void 0,
"../../../script/core-slots/driver/SlotsModel": void 0,
"../../../script/core-slots/line/SlotsLinePlayer": void 0,
"../../../script/core-slots/reel/SlotsChessBoardManager": void 0,
"../../../script/core/audio-player/AudioPlayer": void 0,
"../../../script/core/ease/gsap/CustomEase": void 0,
"../../../script/core/event/EventDispatcher": void 0,
"../../../script/core/fx-player/FXPlayer": void 0,
"../../../script/core/popup-mgr/PopupLayerView": void 0,
"../../../script/core/popup-mgr/PopupMgr": void 0,
"../../../script/core/timer/TimerMgr": void 0,
"../../../script/core/utils/CoreUtils": void 0,
"../../../script/core/utils/CreatorUtils": void 0,
"../../../script/game/view/bars/SlotsCoinRewardView": void 0
} ],
TreegodWheelItem: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "b7b83g04cpMWZ0dd1fA3dhL", "TreegodWheelItem");
Object.defineProperty(o, "__esModule", {
value: !0
});
var r = cc._decorator, a = r.ccclass, n = r.property, i = function(e) {
__extends(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.jpNodes = new Array();
t.bgSprite = null;
t.bgSpriteFrames = new Array();
t.fsTxtParent = null;
t.fsLableParent = null;
t.addNum = null;
t.fsTimes = null;
t.superfsTimes = null;
t.fsTxt = null;
t.superfsTxt = null;
return t;
}
t.prototype.getChangeChild = function() {
return [ this.fsTxtParent, this.fsLableParent ];
};
t.prototype.setItemData = function(e, t, o, r) {
void 0 === r && (r = !1);
this.fsTxtParent.active = !1;
this.fsLableParent.active = !1;
for (var a = 0; a < this.jpNodes.length; a++) this.jpNodes[a].active = !1;
if (e > 0) {
this.bgSprite.spriteFrame = this.bgSpriteFrames[e - 1];
for (a = 0; a < this.jpNodes.length; a++) this.jpNodes[a].active = a + 1 === e;
} else {
this.fsTxtParent.active = !0;
this.fsLableParent.active = !0;
this.fsTimes.string = t;
this.superfsTimes.string = t;
this.addNum.string = "+" + o;
if (r) {
this.fsTxt.active = !1;
this.superfsTxt.active = !0;
this.fsTimes.node.active = !1;
this.superfsTimes.node.active = !0;
} else {
this.fsTxt.active = !0;
this.superfsTxt.active = !1;
this.fsTimes.node.active = !0;
this.superfsTimes.node.active = !1;
}
}
};
__decorate([ n(cc.Node) ], t.prototype, "jpNodes", void 0);
__decorate([ n(cc.Sprite) ], t.prototype, "bgSprite", void 0);
__decorate([ n(cc.SpriteFrame) ], t.prototype, "bgSpriteFrames", void 0);
__decorate([ n(cc.Node) ], t.prototype, "fsTxtParent", void 0);
__decorate([ n(cc.Node) ], t.prototype, "fsLableParent", void 0);
__decorate([ n(cc.Label) ], t.prototype, "addNum", void 0);
__decorate([ n(cc.Label) ], t.prototype, "fsTimes", void 0);
__decorate([ n(cc.Label) ], t.prototype, "superfsTimes", void 0);
__decorate([ n(cc.Node) ], t.prototype, "fsTxt", void 0);
__decorate([ n(cc.Node) ], t.prototype, "superfsTxt", void 0);
return __decorate([ a ], t);
}(cc.Component);
o.default = i;
cc._RF.pop();
}, {} ],
TreegodWheelView: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "6218c8DNp9J9IB38IsMST6e", "TreegodWheelView");
Object.defineProperty(o, "__esModule", {
value: !0
});
var r = e("../../../script/core-slots/driver/SlotsEnum"), a = e("../../../script/core-slots/driver/SlotsGameDriver"), n = e("../../../script/core-slots/driver/SlotsGameState"), i = e("../../../script/core-slots/driver/SlotsJackpot"), s = e("../../../script/core-slots/driver/SlotsModel"), l = e("../../../script/core/audio-player/AudioPlayer"), c = e("../../../script/core/ease/gsap/CustomEase"), d = e("../../../script/core/fx-player/FXPlayer"), p = e("../../../script/core/nets/sfx/SFXNetworkMgr"), u = e("../../../script/core/popup-mgr/PopupLayerView"), f = e("../../../script/core/popup-mgr/PopupMgr"), h = e("../../../script/core/timer/TimerMgr"), y = e("../../../script/core/utils/CreatorUtils"), _ = e("../../../script/game/view/bars/SlotsCoinRewardView"), m = cc._decorator, v = m.ccclass, S = m.property, g = function(e) {
__extends(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.forestmanBg = null;
t.forestmanFrame = null;
t.forestmanLoop = null;
t.forestmanWin = null;
t.forestmanJianTou = null;
t.forestmanGuardian = null;
t.cardParentLayer = null;
t.txtParentLayer = null;
t.moveLayer = null;
t.moveLayerPrefab = null;
t.pointerNode = null;
t._reelNum = 6;
t._bonus_info = null;
t._rollIdx = -1;
return t;
}
t.prototype.playBonusIn = function() {
return __awaiter(this, void 0, void 0, function() {
var e = this;
return __generator(this, function(t) {
switch (t.label) {
case 0:
this.initView();
this.forestmanWin.active = !1;
this.forestmanLoop.active = !1;
this.forestmanBg.active = !1;
this.forestmanFrame.active = !1;
this.forestmanJianTou.active = !1;
this.forestmanJianTou.opacity = 0;
this.forestmanGuardian.active = !1;
l.default.Instance.playEffect("treegod_transition_zhuanpan", !1);
d.default.playSpine(this.forestmanGuardian, "transition_zhuanpan", !1);
h.default.InstanceUnScale.addTimer(125 / 30, function() {
e.forestmanGuardian.active = !1;
});
return [ 4, h.default.InstanceUnScale.addTimerAsync(10 / 30) ];

case 1:
t.sent();
d.default.playSpine(this.forestmanFrame, "appear", !1);
d.default.playSpine(this.forestmanBg, "appear", !1);
return [ 4, h.default.InstanceUnScale.addTimerAsync(65 / 30) ];

case 2:
t.sent();
d.default.playSpine(this.forestmanFrame, "loop", !0);
d.default.playSpine(this.forestmanJianTou, "loop", !0);
this.moveLayer.runAction(cc.fadeIn(.3));
this.forestmanJianTou.runAction(cc.fadeIn(.3));
this.forestmanLoop.active = !0;
return [ 4, h.default.InstanceUnScale.addTimerAsync(1 / 30) ];

case 3:
t.sent();
this.playMove();
return [ 2 ];
}
});
});
};
t.prototype.initView = function() {
this._rollIdx = -1;
var e = s.default.Instance.FeatureData, t = s.default.Instance.FeatureData.bonus_info;
this._bonus_info = t;
var o = (e.collect_count || 0) >= 6;
t.wheel_cfg[t.pos].jp_type <= 0 && (o = (e.collect_count || 0) >= 7);
y.default.destroyNode(this.cardParentLayer, !1);
y.default.destroyNode(this.txtParentLayer, !1);
this.moveLayer.y = -555;
this.moveLayer.opacity = 0;
for (var r = 0, a = 0; a < this._reelNum; a++) for (var n = 0; n < t.wheel_cfg.length; n++) {
var i = t.wheel_cfg[n], l = cc.v2(0, 222 * r + 111);
r += 1;
var c = y.default.getStencilNode(this.moveLayerPrefab, this.cardParentLayer, l);
c.getComponent("TreegodWheelItem").setItemData(i.jp_type, i.fs_times, i.add_lock_count, o);
var d = c.getComponent("TreegodWheelItem").getChangeChild();
y.default.drawCallChangeNodeLayer(this.txtParentLayer, d);
for (var p = 0; p < d.length; p++) {
d[p].x = l.x;
d[p].y = l.y;
}
}
};
t.prototype.playMove = function() {
var e = this, t = this._bonus_info.pos, o = this._bonus_info.wheel_cfg.length, y = 222 * ((this._reelNum - 3) * o + (o - 2 + t));
y = -555 - y;
var m = this.pointerNode.convertToWorldSpaceAR(cc.v2(0, 0));
TweenLite.to(this.moveLayer, 7, {
onUpdate: function() {
for (var t = 0; t < e.cardParentLayer.children.length; t++) {
var o = e.cardParentLayer.children[t].convertToWorldSpaceAR(cc.v2(0, 0)).y;
if (o >= m.y - 20 && o <= m.y + 20 && t !== e._rollIdx) {
l.default.Instance.playEffectWithNoSame("treegod_wheel_roll", !1);
e._rollIdx = t;
break;
}
}
},
onComplete: function() {
a.default.Instance.pauseBgm(!1);
l.default.Instance.playEffect("treegod_wheel_zhuanzhong", !1);
d.default.playSpine(e.forestmanJianTou, "win", !0);
e.forestmanWin.active = !0;
e.forestmanLoop.active = !1;
d.default.playSpine(e.forestmanFrame, "win", !0);
d.default.playSpine(e.forestmanJianTou, "win", !0);
var o = e._bonus_info.wheel_cfg[t];
if (o.jp_type > 0) {
var c = a.default.Instance.getSlotsLogic("SlotsSpinResult");
c.showJpEff(o.jp_type);
h.default.Instance.addTimer(5, function() {
c.showJpEff(o.jp_type, !1);
});
l.default.Instance.playEffect(r.SlotsAudio.Bells);
h.default.Instance.addTimer(4, function() {
l.default.Instance.stopEffect("treegod_wheel_zhuanzhong");
l.default.Instance.stopEffect(r.SlotsAudio.Bells);
_.default.Instance.addMoney(e._bonus_info.jp_win, 6);
f.default.Instance.pushViewByURL(u.PopupLayer.CONTENT, "res/prefab/TreegodJackpotView", {
didShowCallBack: function() {},
closeCallBack: function() {
e.showBigWIn(function() {
i.default.Instance.resetJackpot(o.jp_type - 1, !0);
s.default.Instance.GameStage = {
cur_game_stage: 1,
next_game_stage: 1
};
n.SlotsGameState.Instance.updateGameStage();
e.bonusGameEnd(o);
});
},
data: {
isCollect: !0,
jpType: o.jp_type,
win: e._bonus_info.jp_win
}
}, s.default.Instance.machineBundleName);
});
} else h.default.Instance.addTimer(2, function() {
l.default.Instance.stopEffect("treegod_wheel_zhuanzhong");
p.default.Instance.sendMsgSync("RequestCollectDone", {
id: s.default.Instance.machineId,
type: 1
}).then(function() {
e.bonusGameEnd(o);
});
});
},
ease: c.default.create("custom", [ "M0,0,C0.212,0,0.231,0.164,0.262,0.27,0.29,0.368,0.278,0.352,0.342,0.546,0.456,0.836,0.642,0.934,0.706,0.966,0.723,0.974,0.836,1.030,1,1", "M0,0,C0.212,0,0.231,0.164,0.262,0.27,0.29,0.368,0.278,0.352,0.342,0.546,0.416,0.76,0.466,0.926,0.598,0.97,0.644,0.985,0.852,1,1,1" ][Math.round(Math.random())]),
y: y
});
};
t.prototype.showBigWIn = function(e) {
var t = this._bonus_info.big_win_type, o = this._bonus_info.jp_win, r = a.default.Instance.getSlotsLogic("SlotsSpinResult");
if (t > DocEnum.PrizeType.NORMAL) {
var n = a.default.Instance.getBigWinDuration(t);
_.default.Instance.bigWinRunDigital();
a.default.Instance.showBigWinEffect(t, n, function() {
r.addMoney(o);
e && e();
});
} else {
r.addMoney(o);
e && e();
}
};
t.prototype.bonusGameEnd = function(e) {
if (e.jp_type > 0) ; else {
var t = s.default.Instance.FeatureData, o = t.free_spin;
o || (o = {});
o.fs_lock_info = {
fs_all_lock: [ [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ] ],
fs_next_add_lock: [ [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ] ],
every_spin_add_lock: [ [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ] ],
super_random_add_lock: [ [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0 ] ]
};
o.is_super = (t.collect_count || 0) >= 7;
o.remain_count = e.fs_times;
o.total_count = e.fs_times;
o.add_lock_count = e.add_lock_count;
s.default.Instance.GameStage.next_game_stage = DocEnum.GameStageType.FREESPIN;
n.SlotsGameState.Instance.updateGameStage();
a.default.Instance.getSlotsLogic("SlotsFreeSpin").initFsLock();
}
a.default.Instance.getSlotsLogic("SlotsBonusGame").bonusGameEnd();
};
__decorate([ S(cc.Node) ], t.prototype, "forestmanBg", void 0);
__decorate([ S(cc.Node) ], t.prototype, "forestmanFrame", void 0);
__decorate([ S(cc.Node) ], t.prototype, "forestmanLoop", void 0);
__decorate([ S(cc.Node) ], t.prototype, "forestmanWin", void 0);
__decorate([ S(cc.Node) ], t.prototype, "forestmanJianTou", void 0);
__decorate([ S(cc.Node) ], t.prototype, "forestmanGuardian", void 0);
__decorate([ S(cc.Node) ], t.prototype, "cardParentLayer", void 0);
__decorate([ S(cc.Node) ], t.prototype, "txtParentLayer", void 0);
__decorate([ S(cc.Node) ], t.prototype, "moveLayer", void 0);
__decorate([ S(cc.Node) ], t.prototype, "moveLayerPrefab", void 0);
__decorate([ S(cc.Node) ], t.prototype, "pointerNode", void 0);
return __decorate([ v ], t);
}(cc.Component);
o.default = g;
cc._RF.pop();
}, {
"../../../script/core-slots/driver/SlotsEnum": void 0,
"../../../script/core-slots/driver/SlotsGameDriver": void 0,
"../../../script/core-slots/driver/SlotsGameState": void 0,
"../../../script/core-slots/driver/SlotsJackpot": void 0,
"../../../script/core-slots/driver/SlotsModel": void 0,
"../../../script/core/audio-player/AudioPlayer": void 0,
"../../../script/core/ease/gsap/CustomEase": void 0,
"../../../script/core/fx-player/FXPlayer": void 0,
"../../../script/core/nets/sfx/SFXNetworkMgr": void 0,
"../../../script/core/popup-mgr/PopupLayerView": void 0,
"../../../script/core/popup-mgr/PopupMgr": void 0,
"../../../script/core/timer/TimerMgr": void 0,
"../../../script/core/utils/CreatorUtils": void 0,
"../../../script/game/view/bars/SlotsCoinRewardView": void 0
} ],
TreegodWildCardView: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "ac3ccZ+SmdPOIyI62msOBVb", "TreegodWildCardView");
Object.defineProperty(o, "__esModule", {
value: !0
});
var r = e("../../../script/core-slots/driver/SlotsGameState"), a = e("../../../script/core-slots/driver/SlotsModel"), n = e("../../../script/core-slots/reel/SlotsCardView"), i = e("../../../script/core/timer/TimerMgr"), s = e("../../../script/core/ui-ext/LabelScale"), l = e("../../../script/core/utils/CoreUtils"), c = cc._decorator, d = c.ccclass, p = c.property, u = function(e) {
__extends(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.money = null;
t.jpParent = null;
t.jpNodes = new Array();
t._mult = 0;
t._allWin = 0;
t._jpType = 0;
return t;
}
t.prototype.produceCardView = function(t) {
e.prototype.produceCardView.call(this, t);
this._mult = 0;
this._allWin = 0;
this._jpType = 0;
this.jpParent.y = 0;
this.money.node.y = 0;
this.money.node.active = !1;
this.specialNode.active = !0;
for (var o = 0; o < this.jpNodes.length; o++) this.jpNodes[o].active = !1;
if (null != t.customInfo && null != t.customInfo.CardValue) this._mult = t.customInfo.CardValue; else {
var r = t.posInSeq, a = this.reelView.reelLogic.reelModel.getReelsArrayMoney();
null != a && null != a[r] && (this._mult = a[r]);
}
this._mult < 0 ? this._jpType = this._mult : this._allWin = this._mult;
if (Math.abs(this._mult) > 0) if (this._mult > 0) {
var n = this._mult * this.getCostMoney() / 100;
this.money.node.active = !0;
this.money.nowValue = l.default.abbreviateSegmentDigital(n, 4, 1);
} else Math.abs(this._mult) - 1 < this.jpNodes.length && (this.jpNodes[Math.abs(this._mult) - 1].active = !0);
};
t.prototype.actCardSprite = function() {
if (!this.specialNode.active) {
this.specialNode.active = !0;
this.playBreath(this.breathAnimName);
}
};
t.prototype.inactiveView = function() {
this.closeBreathTimer();
e.prototype.inactiveView.call(this);
};
t.prototype.setCollectFinish = function() {};
t.prototype.getCostMoney = function() {
if (5 === r.SlotsGameState.Instance.currSlotStage) {
var e = a.default.Instance.FeatureData;
if (e.free_spin.is_super) return e.average_bet || 0;
}
return a.default.Instance.SlotsBetCoin;
};
t.prototype.getMoney = function() {
return this._mult;
};
t.prototype.getAllMoney = function() {
return this._allWin;
};
t.prototype.getJpType = function() {
return this._jpType;
};
t.prototype.addMoney = function(e) {
void 0 === e && (e = 0);
e >= 0 ? this._allWin = this._allWin + e : this._jpType = Math.min(e, this._jpType);
if (this._allWin >= 0) {
var t = this._allWin * this.getCostMoney() / 100;
this.money.node.active = !0;
this.money.nowValue = l.default.abbreviateSegmentDigital(t, 4, 1);
if (this._jpType < 0) {
Math.abs(this._jpType) - 1 < this.jpNodes.length && (this.jpNodes[Math.abs(this._jpType) - 1].active = !0);
this.jpParent.y = 20;
this.money.node.y = -30;
}
} else this._jpType < 0 && Math.abs(this._jpType) - 1 < this.jpNodes.length && (this.jpNodes[Math.abs(this._jpType) - 1].active = !0);
};
t.prototype.playStop = function(t) {
var o = this;
this.breathTimer = i.default.Instance.addTimer(20 / 30, function() {
o.reelView.setCard2StopLayer(o, !0);
o.breathTimer = null;
o.playBreath(o.breathAnimName);
});
return e.prototype.playStop.call(this, t);
};
t.prototype.playCollectMoney = function() {
var e = this;
this.closeBreathTimer();
var t = this.reelView.getCardSkeletonData(this._cardId);
this.activeSpine(t);
this.playSpine(this.stopAnimName);
this.breathTimer = i.default.Instance.addTimer(20 / 30, function() {
e.playBreath(e.breathAnimName);
});
};
t.prototype.playWinCollect = function() {
var e = this;
this.closeBreathTimer();
var t = this.reelView.getCardSkeletonData(this._cardId);
this.activeSpine(t);
this.playSpine(this.winningAnimName);
this.breathTimer = i.default.Instance.addTimer(2, function() {
e.playBreath(e.breathAnimName);
});
};
t.prototype.playStopBreath = function() {
this.closeBreathTimer();
var e = this.reelView.getCardSkeletonData(this._cardId);
this.activeSpine(e);
this.reelView.setCard2StopLayer(this, !0);
this.playBreath(this.breathAnimName);
};
__decorate([ p(s.default) ], t.prototype, "money", void 0);
__decorate([ p(cc.Node) ], t.prototype, "jpParent", void 0);
__decorate([ p(cc.Node) ], t.prototype, "jpNodes", void 0);
return __decorate([ d ], t);
}(n.default);
o.default = u;
cc._RF.pop();
}, {
"../../../script/core-slots/driver/SlotsGameState": void 0,
"../../../script/core-slots/driver/SlotsModel": void 0,
"../../../script/core-slots/reel/SlotsCardView": void 0,
"../../../script/core/timer/TimerMgr": void 0,
"../../../script/core/ui-ext/LabelScale": void 0,
"../../../script/core/utils/CoreUtils": void 0
} ]
}, {}, [ "TreegodBonusGame", "TreegodCardView", "TreegodDataParser", "TreegodFlyMoney", "TreegodFreeSpin", "TreegodFsEnd", "TreegodFsStart", "TreegodFsm", "TreegodJackpotView", "TreegodLockPrefab", "TreegodRoot", "TreegodSingleSpin", "TreegodSpinResult", "TreegodWheelItem", "TreegodWheelView", "TreegodWildCardView" ]);