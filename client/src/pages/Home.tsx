/*
 * 设计哲学：新中式赛博宫灯界面。
 */
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, RotateCw, RefreshCw, Swords, Trophy, X, Coins } from "lucide-react";

import { Button } from "@/components/ui/button";

const lobbyPendantImage =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663532081903/QkUdLPWPqxs35uGJzRzmcR/pendant_c4abde94.png";
const glowOrnament =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663532081903/QkUdLPWPqxs35uGJzRzmcR/ring-glow-ornament-Dt49yWpi8Yg2G6645sLada.webp";

type ViewMode = "lobby" | "accept" | "detail" | "game";

type TaskRing = {
  id: number;
  title: string;
  game: string;
  zone: string;
  type: string;
  reward: string;
  target: number;
  char: string;
};

const ringPlan: TaskRing[] = [
  { id: 1, title: "初露锋芒", game: "跑胡子", zone: "新手区",   type: "热身环", reward: "荣誉经验 +60",   target: 1, char: "福" },
  { id: 2, title: "步步高升", game: "跑胡子", zone: "新手区",   type: "进阶环", reward: "荣誉经验 +120",  target: 1, char: "運" },
  { id: 3, title: "金环加身", game: "跑胡子", zone: "高手入门", type: "倍场环", reward: "荣誉经验 ×1.5",  target: 1, char: "發" },
  { id: 4, title: "大展宏图", game: "三打哈", zone: "跨游戏",   type: "探索环", reward: "探索宝箱",       target: 1, char: "光" },
  { id: 5, title: "满载而归", game: "跑胡子", zone: "高手入门", type: "挑战环", reward: "福运大满贯箱",    target: 1, char: "财" },
];

const alternativeTasks: Record<number, Pick<TaskRing, "game" | "zone" | "target" | "reward">> = {
  1: { game: "三打哈",   zone: "休闲馆",   target: 1, reward: "荣誉 +40" },
  2: { game: "跑得快",   zone: "常玩区",   target: 1, reward: "免扣发财券 ×1" },
  3: { game: "字牌馆",   zone: "积分赛",   target: 3, reward: "荣誉 ×1.2" },
  4: { game: "跑胡子",   zone: "常玩倍场", target: 2, reward: "探索宝箱 ×2" },
  5: { game: "三打哈",   zone: "高手区",   target: 2, reward: "稀有礼包" },
};

const grandPrizeRewards = [
  { icon: "🧠", name: "悟性",      desc: "×500",          tag: "属性提升" },
  { icon: "👘", name: "限定旗袍",   desc: "永久装扮",       tag: "限定" },
  { icon: "🎟️", name: "代金券",    desc: "×5（面值10元）",  tag: "可充值" },
  { icon: "🪙", name: "金币",      desc: "×2000",         tag: "通用货币" },
  { icon: "🖼️", name: "特效头像框", desc: "30天",          tag: "限时" },
  { icon: "🎁", name: "惊喜礼包",   desc: "随机稀有道具",    tag: "随机" },
];

const BEAD_ANGLES = [90, 18, 306, 234, 162];

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function BeadRing({
  activeRingId,
  focusedRingId,
  progressMap,
  effectiveRings,
  onBeadClick,
}: {
  activeRingId: number;
  focusedRingId: number;
  progressMap: Record<number, number>;
  effectiveRings: TaskRing[];
  onBeadClick?: (ringId: number) => void;
}) {
  const size = 230, cx = size / 2, cy = size / 2, r = 89, beadSize = 68;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <img src="/ring.png" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
      {effectiveRings.map((ring, i) => {
        const pos      = polarToXY(cx, cy, r, BEAD_ANGLES[i]);
        const isDone   = progressMap[ring.id] >= ring.target;
        const isActive = ring.id === activeRingId && !isDone;
        const isFocused = ring.id === focusedRingId;
        return (
          <div
            key={ring.id}
            className={`bead-node ${isDone ? "bead-done" : isActive ? "bead-active" : "bead-locked"} ${isFocused ? "bead-focused" : ""}`}
            style={{ position: "absolute", left: pos.x, top: pos.y, width: beadSize, height: beadSize, transform: "translate(-50%,-50%)", cursor: "pointer" }}
            onClick={() => onBeadClick?.(ring.id)}
          >
            <img src="/bead.png" alt="" className="bead-img" />
            <span className="bead-label">{isDone ? "✔" : isActive ? ring.id : "🔒"}</span>
          </div>
        );
      })}
    </div>
  );
}

const initialProgressMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } satisfies Record<number, number>;

export default function Home() {
  const [view, setView] = useState<ViewMode>("lobby");
  const [activeRingId, setActiveRingId]   = useState(1); // 当前进行中的环（自动推进）
  const [focusedRingId, setFocusedRingId] = useState(1); // 珠子点击查看的环
  const [progressMap, setProgressMap] = useState<Record<number, number>>(initialProgressMap);
  const [showRewardBurst, setShowRewardBurst] = useState(false);
  const [lastCompletedRingId, setLastCompletedRingId] = useState<number | null>(null);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [replacedRings, setReplacedRings] = useState<Record<number, Pick<TaskRing, "game" | "zone" | "target" | "reward">>>({});
  const [showGrandPrizeModal, setShowGrandPrizeModal] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);       // 当前第几轮
  const [completedRounds, setCompletedRounds] = useState(0); // 今日已完成轮数
  const [hasActiveTask, setHasActiveTask] = useState(false); // 是否已领取任务

  const effectiveRings: TaskRing[] = ringPlan.map((ring) =>
    replacedRings[ring.id] ? { ...ring, ...replacedRings[ring.id] } : ring
  );

  // 查看面板显示 focusedRing，但"去完成"只对 activeRing 开放
  const focusedRing = effectiveRings.find((r) => r.id === focusedRingId) ?? effectiveRings[0];
  const activeRing  = effectiveRings.find((r) => r.id === activeRingId)  ?? effectiveRings[0];
  const focusedIsDone   = progressMap[focusedRing.id] >= focusedRing.target;
  const focusedIsLocked = focusedRing.id > activeRingId;
  const canGoComplete   = focusedRingId === activeRingId && !focusedIsDone;

  const currentRingProgress = Math.min(100, (progressMap[activeRing.id] / activeRing.target) * 100);
  const allDone = effectiveRings.every((r) => (progressMap[r.id] ?? 0) >= r.target);
  const completedCount = effectiveRings.filter((r) => (progressMap[r.id] ?? 0) >= r.target).length;
  const replacementPreview = alternativeTasks[focusedRingId];

  // 完成一环后，focusedRingId 跟随 activeRingId
  useEffect(() => {
    setFocusedRingId(activeRingId);
  }, [activeRingId]);

  useEffect(() => {
    if (!showRewardBurst) return;
    const timer = window.setTimeout(() => setShowRewardBurst(false), 2500);
    return () => window.clearTimeout(timer);
  }, [showRewardBurst]);

  const handleOpenAccept  = () => hasActiveTask ? setView("detail") : setView("accept");
  const handleBackToLobby = () => setView("lobby");
  const handleAcceptTask  = () => { setHasActiveTask(true); setView("detail"); };

  const handleGoComplete = () => {
    setView("game");
  };

  const handleBeadClick = (ringId: number) => setFocusedRingId(ringId);

  const handleRestart = () => {
    setCompletedRounds((prev) => Math.min(5, prev + 1));
    setCurrentRound((prev) => prev + 1);
    setProgressMap(initialProgressMap);
    setActiveRingId(1);
    setFocusedRingId(1);
    setLastCompletedRingId(null);
    setReplacedRings({});
  };

  const handleConfirmReplace = () => {
    const alt = replacementPreview;
    setReplacedRings((prev) => ({ ...prev, [focusedRingId]: alt }));
    setProgressMap((prev) => ({ ...prev, [focusedRingId]: 0 }));
    setShowReplaceModal(false);
  };

  const handleSimulateRound = () => {
    const ringId     = activeRing.id;
    const ringTarget = activeRing.target;
    const nextRing   = effectiveRings.find((r) => r.id === ringId + 1);

    setProgressMap((prev) => {
      const currentValue = prev[ringId];
      if (currentValue >= ringTarget) return prev;
      const nextValue = Math.min(ringTarget, currentValue + 1);
      const nextState = { ...prev, [ringId]: nextValue };

      if (nextValue < ringTarget) {
        return nextState;
      }

      queueMicrotask(() => {
        setLastCompletedRingId(ringId);
        if (nextRing) setActiveRingId(nextRing.id);
        setShowRewardBurst(true);
      });
      return nextState;
    });
  };

  const completedRing      = lastCompletedRingId ? effectiveRings.find((r) => r.id === lastCompletedRingId) : null;
  const nextAfterCompleted = lastCompletedRingId ? effectiveRings.find((r) => r.id === lastCompletedRingId + 1) : null;

  return (
    <div className="min-h-screen overflow-hidden bg-neutral-900 text-foreground">
      <div className="prototype-noise" />
      <main className="prototype-stage-shell">
        <section className="prototype-phone-stage">
          <div className="prototype-phone-frame">
            <div className="prototype-phone-inner">
              <AnimatePresence mode="wait">

                {/* ── 大厅 ── */}
                {view === "lobby" && (
                  <motion.div key="lobby" className="prototype-screen prototype-screen-lobby"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }}>
                    <div className="lobby-sidebar-pendant">
                      <div className="lobby-pendant-entry">
                        <img src={glowOrnament} alt="" className="lobby-pendant-glow" />
                        <button type="button" onClick={handleOpenAccept} className="lobby-pendant-btn" aria-label="点击挂件展开任务弹窗">
                          <img src={lobbyPendantImage} alt="福运盘挂件" className="lobby-pendant-img" />
                          <div className="pendant-guide-ring" />
                          <div className="pendant-guide-ring pendant-guide-ring-2" />
                        </button>
                      </div>
                      <div className="lobby-pendant-label">福运任务</div>
                    </div>
                  </motion.div>
                )}

                {/* ── 领取任务 ── */}
                {view === "accept" && (
                  <motion.div key="accept" className="prototype-screen accept-screen-wrapper"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }}>
                    <div className="accept-card">
                      <button className="accept-close-btn" onClick={handleBackToLobby}><X className="h-4 w-4" /></button>

                      <div className="accept-pendant-wrap">
                        <img src={glowOrnament} alt="" className="accept-pendant-glow" />
                        <img src={lobbyPendantImage} alt="福运盘挂件" className="accept-pendant-img" />
                      </div>

                      <div className="accept-title">🧧 福运任务</div>
                      <div className="accept-desc">完成 5 环连线任务，凝聚万千福运</div>

                      <div className="accept-rules">
                        <div className="accept-rule-item">
                          <div className="accept-rule-icon-wrap">🎯</div>
                          <span>5 环任务</span>
                        </div>
                        <div className="accept-rule-connector">• • •</div>
                        <div className="accept-rule-item">
                          <div className="accept-rule-icon-wrap">🔒</div>
                          <span>顺序解锁</span>
                        </div>
                        <div className="accept-rule-connector">• • •</div>
                        <div className="accept-rule-item">
                          <div className="accept-rule-icon-wrap">🎁</div>
                          <span>大满贯箱</span>
                        </div>
                      </div>

                      <div className="accept-btn-group">
                        <Button className="prototype-gold-button prototype-large-button" onClick={handleAcceptTask}>
                          立即领取
                        </Button>
                        <Button variant="secondary" className="prototype-secondary-button" onClick={handleBackToLobby}>
                          下次再说
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── 任务详情 ── */}
                {view === "detail" && (
                  <motion.div key="detail" className="prototype-screen task-detail-screen"
                    initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.28 }}>

                    <div className="task-detail-panel">
                    <div className="task-detail-header">
                      <div className="task-detail-header-side" />
                      <h2 className="task-detail-title">🏮 福运环任务 🏮</h2>
                      <div className="task-detail-header-side task-detail-header-btns">
                        <button className="task-icon-btn" onClick={handleBackToLobby}><X className="h-4 w-4" /></button>
                        {/* 替换按钮：仅当聚焦环是当前未完成的 activeRing 时才可用 */}
                        <button
                          className="task-icon-btn"
                          onClick={() => setShowReplaceModal(true)}
                          disabled={focusedRingId !== activeRingId || focusedIsDone}
                          title={focusedRingId !== activeRingId || focusedIsDone ? "只能替换当前进行中的环" : "替换本环任务"}
                          style={{ opacity: (focusedRingId !== activeRingId || focusedIsDone) ? 0.35 : 1, cursor: (focusedRingId !== activeRingId || focusedIsDone) ? "not-allowed" : "pointer" }}
                        >
                          <RotateCw className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* 大奖锚点条 */}
                    <button
                      className={`prize-anchor${allDone ? " prize-anchor-done" : ""}`}
                      onClick={() => setShowGrandPrizeModal(true)}
                    >
                      <span className="prize-anchor-icon">🏆</span>
                      <div className="prize-anchor-info">
                        <span className="prize-anchor-name">
                          福运大满贯箱
                          <span className="prize-anchor-round-badge">第 {currentRound} 轮</span>
                        </span>
                        <span className="prize-anchor-progress">
                          {allDone
                            ? `奖励已发放 🎊 · 今日 ${completedRounds + 1} / 5 轮`
                            : `本轮已完成 ${completedCount} / 5 环 · 今日 ${completedRounds} / 5 轮`}
                        </span>
                      </div>
                      <div className="prize-anchor-rewards">
                        <div className="prize-reward-chip"><span>⭐</span><span>荣誉经验</span></div>
                        <div className="prize-reward-chip"><span>🪙</span><span>金豆豆</span></div>
                        <div className="prize-reward-chip"><span>🎁</span><span>限定装扮</span></div>
                      </div>
                      <span className="prize-anchor-arrow">›</span>
                    </button>

                    <div className="task-detail-body">
                      <div className="task-detail-left">
                        <BeadRing
                          activeRingId={activeRingId}
                          focusedRingId={focusedRingId}
                          progressMap={progressMap}
                          effectiveRings={effectiveRings}
                          onBeadClick={handleBeadClick}
                        />
                      </div>

                      <div className="task-detail-right">
                        <div className="task-desc-card">
                          <div style={{ marginBottom: "0.15rem" }}>
                            <span className="task-desc-badge">第 {focusedRing.id} 环 · {focusedRing.title}</span>
                          </div>
                          <div className="task-desc-title">【{focusedRing.game}】{focusedRing.zone !== "跨游戏" ? focusedRing.zone : ""}</div>
                          <div className="task-desc-progress">
                            完成 {focusedRing.target} 局（{progressMap[focusedRing.id]}/{focusedRing.target}）
                          </div>
                          <div className="task-desc-reward">
                            <span>奖励</span>
                            <strong>{focusedRing.reward}</strong>
                          </div>
                        </div>

                        {/* 去完成按钮：根据状态显示不同文案，用 disabled 属性控制 */}
                        {focusedIsDone ? (
                          <Button className="go-play-btn go-play-done" disabled>✔ 本环已完成</Button>
                        ) : focusedIsLocked ? (
                          <Button className="go-play-btn go-play-locked" disabled>🔒 请先完成第 {activeRingId} 环</Button>
                        ) : (
                          <Button className="go-play-btn" disabled={!canGoComplete} onClick={handleGoComplete}>
                            去完成
                          </Button>
                        )}

                        {/* 全部完成时显示开启下一轮 */}
                        {allDone && (
                          <Button className="next-round-btn" onClick={handleRestart}>
                            开启下一轮 →
                          </Button>
                        )}

                      </div>
                    </div>
                    </div>{/* /task-detail-panel */}

                    {/* 替换任务弹窗 */}
                    <AnimatePresence>
                      {showReplaceModal && (
                        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          onClick={() => setShowReplaceModal(false)}>
                          <motion.div className="modal-card"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 28 }}
                            onClick={(e) => e.stopPropagation()}>
                            <div className="modal-title">替换任务</div>
                            <div className="modal-cost">
                              <Coins className="h-4 w-4" style={{ color: "#f5c842" }} />
                              <span>消耗 <strong>10 金币</strong> 替换本环任务</span>
                            </div>
                            <div className="replace-compare">
                              <div className="replace-task-block replace-task-old">
                                <div className="replace-task-tag">当前</div>
                                <div className="replace-task-name">【{focusedRing.game}】{focusedRing.zone}</div>
                                <div className="replace-task-sub">完成 {focusedRing.target} 局</div>
                              </div>
                              <div className="replace-arrow">→</div>
                              <div className="replace-task-block replace-task-new">
                                <div className="replace-task-tag new">替换</div>
                                <div className="replace-task-name">【{replacementPreview.game}】{replacementPreview.zone}</div>
                                <div className="replace-task-sub">完成 {replacementPreview.target} 局</div>
                              </div>
                            </div>
                            <div className="modal-actions">
                              <Button className="prototype-gold-button" onClick={handleConfirmReplace}>确认替换（-10 金币）</Button>
                              <Button variant="secondary" className="prototype-secondary-button" onClick={() => setShowReplaceModal(false)}>取消</Button>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* 大奖预览弹窗 */}
                    <AnimatePresence>
                      {showGrandPrizeModal && (
                        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          onClick={() => setShowGrandPrizeModal(false)}>
                          <motion.div className="modal-card modal-card-wide"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 28 }}
                            onClick={(e) => e.stopPropagation()}>
                            <div className="modal-title">🎁 福运大满贯箱</div>
                            <div className="modal-subtitle">完成全部 5 环即可领取</div>
                            <div className="grand-prize-grid">
                              {grandPrizeRewards.map((item) => (
                                <div key={item.name} className="grand-prize-item">
                                  <div className="grand-prize-icon">{item.icon}</div>
                                  <div className="grand-prize-item-name">{item.name}</div>
                                  <div className="grand-prize-item-desc">{item.desc}</div>
                                  <div className="grand-prize-item-tag">{item.tag}</div>
                                </div>
                              ))}
                            </div>
                            <Button variant="secondary" className="prototype-secondary-button" style={{ width: "100%", marginTop: "0.5rem" }} onClick={() => setShowGrandPrizeModal(false)}>关闭</Button>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* ── 游戏模拟 ── */}
                {view === "game" && (
                  <motion.div key="game" className="prototype-screen prototype-screen-game"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.32 }}>

                    <div className="prototype-gameplay-panel">
                      <div className="prototype-gameplay-card">
                        <div className="prototype-gameplay-card-top">
                          <div className="prototype-combat-chip">
                            <Swords className="h-4 w-4" style={{ flexShrink: 0 }} />
                            <div className="prototype-combat-sub">【{activeRing.game}】{activeRing.zone !== "跨游戏" ? activeRing.zone : ""} · 完成 {activeRing.target} 局</div>
                          </div>
                          <Button variant="ghost" className="prototype-ghost-button" onClick={() => setView("detail")}>
                            <ArrowLeft className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="prototype-ring-progress-panel">
                          <div className="prototype-ring-progress-top">
                            <span>第 {activeRing.id} 环进度</span>
                            <strong>{progressMap[activeRing.id]}/{activeRing.target}</strong>
                          </div>
                          <div className="prototype-detail-progress-bar large">
                            <motion.div className="prototype-detail-progress-fill" initial={false}
                              animate={{ width: `${currentRingProgress}%` }}
                              transition={{ type: "spring", stiffness: 120, damping: 18 }} />
                          </div>
                        </div>
                        <div className="prototype-gameplay-actions">
                          {allDone ? (
                            <Button className="prototype-gold-button prototype-large-button" onClick={handleRestart}>
                              <RefreshCw className="h-4 w-4 mr-2" />重新开始新一轮
                            </Button>
                          ) : (
                            <Button className="prototype-gold-button prototype-large-button" onClick={handleSimulateRound}>
                              完成一局
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {showRewardBurst && (
                        <motion.div className="prototype-success-burst"
                          initial={{ opacity: 0, scale: completedRing?.id === 5 ? 0.8 : 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{ type: "spring", stiffness: completedRing?.id === 5 ? 200 : 300, damping: 22 }}>
                          <div className={`prototype-success-card${completedRing?.id === 5 ? " prototype-success-card-grand" : ""}`}>
                            <Trophy className={completedRing?.id === 5 ? "h-12 w-12" : "h-8 w-8"} style={{ color: "#f5c842", flexShrink: 0 }} />
                            <div>
                              <strong>{completedRing?.id === 5 ? "🎊 大满贯！全部完成！" : `第 ${completedRing?.id} 环完成`}</strong>
                              <p>{nextAfterCompleted
                                ? `已获得：${completedRing?.reward}，解锁第 ${nextAfterCompleted.id} 环`
                                : `已获得：${completedRing?.reward}，福运大满贯箱已解锁！`}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
