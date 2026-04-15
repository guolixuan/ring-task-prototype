/*
 * 设计哲学：新中式赛博宫灯界面。
 * 当前页面必须始终强化“红金庆典、环状叙事、即时反馈”三项原则：
 * 1. 大厅是主舞台，挂件必须成为第一视觉中心；
 * 2. 任务详情必须清楚展示 1-5 环进度与当前环状态；
 * 3. 去完成后的反馈必须具备明显的任务推进感，而不是静态跳页。
 */
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Circle,
  Coins,
  Gift,
  Sparkles,
  Star,
  Swords,
  Trophy,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

const lobbyPendantImage =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663532081903/QkUdLPWPqxs35uGJzRzmcR/Gemini_Generated_Image_93cngi93cngi93cn_7641f96b.webp";
const detailReferenceImage =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663532081903/QkUdLPWPqxs35uGJzRzmcR/57b2c53a-ade6-4569-b5bc-27c9982d265c_8acf9b6e.png";
const mainStageBackground =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663532081903/QkUdLPWPqxs35uGJzRzmcR/ring-bg-main-CLLNJdM7fLnaXhJ4zNtBqv.webp";
const gameplayBackground =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663532081903/QkUdLPWPqxs35uGJzRzmcR/ring-bg-gameplay-VWXcXkz6i2ybA8ybgJHcLZ.webp";
const glowOrnament =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663532081903/QkUdLPWPqxs35uGJzRzmcR/ring-glow-ornament-Dt49yWpi8Yg2G6645sLada.webp";

type TaskStatus = "done" | "active" | "locked";
type ViewMode = "lobby" | "detail" | "game";

type TaskRing = {
  id: number;
  title: string;
  subtitle: string;
  game: string;
  type: string;
  reward: string;
  target: number;
};

const ringPlan: TaskRing[] = [
  {
    id: 1,
    title: "热身环",
    subtitle: "跑胡子 × 常玩倍场 · 完成 1 局",
    game: "跑胡子",
    type: "对局任务",
    reward: "荣誉 +60",
    target: 1,
  },
  {
    id: 2,
    title: "进阶环",
    subtitle: "字牌馆 · 今日打两把",
    game: "字牌馆",
    type: "特色任务",
    reward: "聚宝盆礼包 + 免扣发财券",
    target: 2,
  },
  {
    id: 3,
    title: "倍场环",
    subtitle: "跑胡子 × 升倍场 · 完成 2 局",
    game: "跑胡子升倍场",
    type: "倍场任务",
    reward: "荣誉 ×1.5",
    target: 2,
  },
  {
    id: 4,
    title: "探索环",
    subtitle: "三打哈 · 完成 1 局",
    game: "三打哈",
    type: "跨游戏体验",
    reward: "探索宝箱",
    target: 1,
  },
  {
    id: 5,
    title: "挑战环",
    subtitle: "自由选择 × 常玩倍场 · 赢 1 局",
    game: "自由选择",
    type: "挑战任务",
    reward: "福运大满贯箱",
    target: 1,
  },
];

const initialProgressMap = { 1: 1, 2: 0, 3: 0, 4: 0, 5: 0 } satisfies Record<number, number>;

function getRingStatus(id: number, activeRingId: number, progressMap: Record<number, number>): TaskStatus {
  const ring = ringPlan.find((item) => item.id === id);
  if (!ring) return "locked";
  if (progressMap[id] >= ring.target) return "done";
  if (id === activeRingId) return "active";
  return id < activeRingId ? "done" : "locked";
}

function StepBadge({ status, index }: { status: TaskStatus; index: number }) {
  if (status === "done") {
    return (
      <div className="prototype-step-badge prototype-step-badge-done">
        <CheckCircle2 className="h-5 w-5" />
      </div>
    );
  }

  if (status === "active") {
    return <div className="prototype-step-badge prototype-step-badge-active">{index}</div>;
  }

  return (
    <div className="prototype-step-badge prototype-step-badge-locked">
      <Circle className="h-4 w-4" />
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<ViewMode>("lobby");
  const [activeRingId, setActiveRingId] = useState(2);
  const [progressMap, setProgressMap] = useState<Record<number, number>>(initialProgressMap);
  const [showRewardBurst, setShowRewardBurst] = useState(false);
  const [showDetailOverlay, setShowDetailOverlay] = useState(false);

  const activeRing = ringPlan.find((item) => item.id === activeRingId) ?? ringPlan[1];
  const finishedCount = useMemo(
    () => ringPlan.filter((item) => progressMap[item.id] >= item.target).length,
    [progressMap],
  );
  const totalProgress = (finishedCount / ringPlan.length) * 100;
  const currentRingProgress = Math.min(
    100,
    (progressMap[activeRing.id] / activeRing.target) * 100,
  );

  useEffect(() => {
    if (view === "detail") {
      const timer = window.setTimeout(() => setShowDetailOverlay(true), 120);
      return () => window.clearTimeout(timer);
    }

    setShowDetailOverlay(false);
  }, [view]);

  useEffect(() => {
    if (!showRewardBurst) return;

    const timer = window.setTimeout(() => {
      setShowRewardBurst(false);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [showRewardBurst]);

  const handleOpenTaskDetail = () => {
    setView("detail");
    toast("已展开任务弹窗", {
      description: "当前为第 2 环，可查看 1-5 环步骤并前往完成。",
    });
  };

  const handleBackToLobby = () => {
    setView("lobby");
  };

  const handleGoComplete = () => {
    setView("game");
    toast("模拟进入游戏", {
      description: `当前任务：${activeRing.subtitle}`,
    });
  };

  const handleSimulateRound = () => {
    const ringId = activeRing.id;
    const ringTarget = activeRing.target;
    const ringTitle = activeRing.title;
    const nextRing = ringPlan.find((item) => item.id === ringId + 1);

    setProgressMap((prev) => {
      const currentValue = prev[ringId];
      if (currentValue >= ringTarget) {
        return prev;
      }

      const nextValue = Math.min(ringTarget, currentValue + 1);
      const nextState = {
        ...prev,
        [ringId]: nextValue,
      };

      if (nextValue < ringTarget) {
        queueMicrotask(() => {
          toast("任务进度已更新", {
            description: `${ringTitle}：${nextValue}/${ringTarget}`,
          });
        });
        return nextState;
      }

      queueMicrotask(() => {
        if (nextRing) {
          setActiveRingId(nextRing.id);
        }
        setShowRewardBurst(true);
        toast.success(`第 ${ringId} 环完成`, {
          description: nextRing
            ? `已解锁第 ${nextRing.id} 环，轮进度更新为 ${Math.min(ringId, 5)}/5。`
            : "恭喜完成整轮任务。",
        });
      });

      return nextState;
    });
  };

  const statusText =
    finishedCount >= ringPlan.length
      ? "本轮 5 环已全部完成，可领取轮终大奖。"
      : view === "game"
        ? `正在模拟完成：${activeRing.subtitle}`
        : `当前激活：第 ${activeRingId} 环 · ${activeRing.title}`;

  return (
    <div
      className="min-h-screen overflow-hidden bg-background text-foreground"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(15, 7, 7, 0.28), rgba(15, 7, 7, 0.82)), url(${mainStageBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="prototype-noise" />
      <main className="prototype-stage-shell">
        <section className="prototype-intro-panel">
          <div className="prototype-kicker">
            <Sparkles className="h-4 w-4" />
            环式任务高保真交互原型
          </div>
          <h1 className="prototype-title">福运盘串环任务</h1>
          <p className="prototype-description">
            该原型严格使用你提供的两张界面图作为核心视觉资产：大厅页展示常驻挂件，任务详情页保留原始设计氛围，并加入可点击、可模拟完成、可实时刷新状态的交互逻辑。
          </p>

          <div className="prototype-highlight-grid">
            <div className="prototype-highlight-card">
              <span>原型路径</span>
              <strong>大厅挂件 → 展开弹窗 → 去完成 → 完成反馈 → 更新进度</strong>
            </div>
            <div className="prototype-highlight-card">
              <span>当前状态</span>
              <strong>{statusText}</strong>
            </div>
          </div>

          <div className="prototype-step-legend">
            {ringPlan.map((ring) => {
              const status = getRingStatus(ring.id, activeRingId, progressMap);
              return (
                <div key={ring.id} className={`prototype-step-legend-item status-${status}`}>
                  <StepBadge status={status} index={ring.id} />
                  <div>
                    <p>第 {ring.id} 环</p>
                    <strong>{ring.title}</strong>
                    <span>{ring.subtitle}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="prototype-phone-stage">
          <div className="prototype-phone-frame">
            <div className="prototype-phone-inner">
              <div className="prototype-phone-status">
                <div>
                  <span>今日轮进度</span>
                  <strong>
                    {finishedCount}/{ringPlan.length}
                  </strong>
                </div>
                <div className="prototype-status-pills">
                  <span className="prototype-pill">
                    <Coins className="h-3.5 w-3.5" /> 福气值 Lv.3
                  </span>
                  <span className="prototype-pill">
                    <Star className="h-3.5 w-3.5" /> Lv.4
                  </span>
                </div>
              </div>

              <div className="prototype-total-progress">
                <div className="prototype-total-progress-bar">
                  <motion.div
                    className="prototype-total-progress-fill"
                    initial={false}
                    animate={{ width: `${totalProgress}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 18 }}
                  />
                </div>
                <span>{Math.round(totalProgress)}%</span>
              </div>

              <AnimatePresence mode="wait">
                {view === "lobby" && (
                  <motion.div
                    key="lobby"
                    className="prototype-screen prototype-screen-lobby"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.32 }}
                  >
                    <div className="prototype-screen-topline">大厅常驻挂件</div>
                    <div className="prototype-pendant-wrap">
                      <img src={glowOrnament} alt="挂件光效" className="prototype-pendant-glow" />
                      <button
                        type="button"
                        onClick={handleOpenTaskDetail}
                        className="prototype-pendant-button"
                        aria-label="点击挂件展开任务弹窗"
                      >
                        <img src={lobbyPendantImage} alt="福运盘挂件" className="prototype-pendant-image" />
                        <div className="prototype-pendant-pulse" />
                      </button>
                    </div>

                    <div className="prototype-lobby-card">
                      <div>
                        <span>大厅领取任务按钮</span>
                        <strong>点击挂件展开任务弹窗</strong>
                      </div>
                      <Button className="prototype-gold-button" onClick={handleOpenTaskDetail}>
                        领取今日任务
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {view === "detail" && (
                  <motion.div
                    key="detail"
                    className="prototype-screen prototype-screen-detail"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.32 }}
                  >
                    <div className="prototype-reference-wrap">
                      <img src={detailReferenceImage} alt="任务详情设计参考图" className="prototype-reference-image" />
                      <div className="prototype-reference-mask" />
                      <div className="prototype-reference-header">
                        <Button variant="ghost" className="prototype-ghost-button" onClick={handleBackToLobby}>
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                          <span>任务详情界面</span>
                          <strong>福运盘串环（第 {activeRingId} 环）</strong>
                        </div>
                        <Button variant="ghost" className="prototype-ghost-button" onClick={handleBackToLobby}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <motion.div
                        className="prototype-detail-overlay"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: showDetailOverlay ? 1 : 0, y: showDetailOverlay ? 0 : 12 }}
                        transition={{ duration: 0.28, ease: "easeOut" }}
                      >
                        <div className="prototype-current-ring-card">
                          <div>
                            <span>当前任务</span>
                            <strong>{activeRing.subtitle}</strong>
                            <p>
                              目标进度 {progressMap[activeRing.id]}/{activeRing.target} · 奖励 {activeRing.reward}
                            </p>
                          </div>
                          <Button className="prototype-gold-button" onClick={handleGoComplete}>
                            去完成
                          </Button>
                        </div>

                        <div className="prototype-detail-progress-card">
                          <div className="prototype-detail-progress-head">
                            <div>
                              <span>1-5 环清晰步骤</span>
                              <strong>本轮任务进度</strong>
                            </div>
                            <div className="prototype-mini-total">{finishedCount}/5</div>
                          </div>
                          <div className="prototype-detail-progress-bar">
                            <motion.div
                              className="prototype-detail-progress-fill"
                              initial={false}
                              animate={{ width: `${totalProgress}%` }}
                              transition={{ type: "spring", stiffness: 120, damping: 20 }}
                            />
                          </div>

                          <div className="prototype-step-list">
                            {ringPlan.map((ring) => {
                              const status = getRingStatus(ring.id, activeRingId, progressMap);
                              const progress = progressMap[ring.id];
                              return (
                                <div key={ring.id} className={`prototype-step-card status-${status}`}>
                                  <StepBadge status={status} index={ring.id} />
                                  <div className="prototype-step-copy">
                                    <div className="prototype-step-headline">
                                      <strong>
                                        第 {ring.id} 环 · {ring.title}
                                      </strong>
                                      <span>{status === "done" ? "已完成" : status === "active" ? "进行中" : "待解锁"}</span>
                                    </div>
                                    <p>{ring.subtitle}</p>
                                    <div className="prototype-step-meta">
                                      <span>{ring.type}</span>
                                      <span>
                                        {progress}/{ring.target}
                                      </span>
                                      <span>{ring.reward}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {view === "game" && (
                  <motion.div
                    key="game"
                    className="prototype-screen prototype-screen-game"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.32 }}
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(30, 11, 10, 0.16), rgba(30, 11, 10, 0.82)), url(${gameplayBackground})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="prototype-screen-topline">模拟进入游戏</div>
                    <div className="prototype-gameplay-head">
                      <div>
                        <span>当前任务</span>
                        <strong>{activeRing.subtitle}</strong>
                      </div>
                      <Button variant="ghost" className="prototype-ghost-button" onClick={() => setView("detail")}>
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="prototype-gameplay-card">
                      <div className="prototype-combat-chip">
                        <Swords className="h-4 w-4" />
                        字牌馆对局模拟中
                      </div>
                      <h2>完成任务时同步反馈状态变化</h2>
                      <p>
                        点击下方按钮可模拟完成一局。到达目标后会立即出现完成提示、轮进度更新，并解锁下一环。
                      </p>

                      <div className="prototype-ring-progress-panel">
                        <div className="prototype-ring-progress-top">
                          <span>第 {activeRing.id} 环进度</span>
                          <strong>
                            {progressMap[activeRing.id]}/{activeRing.target}
                          </strong>
                        </div>
                        <div className="prototype-detail-progress-bar large">
                          <motion.div
                            className="prototype-detail-progress-fill"
                            initial={false}
                            animate={{ width: `${currentRingProgress}%` }}
                            transition={{ type: "spring", stiffness: 120, damping: 18 }}
                          />
                        </div>
                      </div>

                      <div className="prototype-gameplay-actions">
                        <Button className="prototype-gold-button prototype-large-button" onClick={handleSimulateRound}>
                          完成一局
                        </Button>
                        <Button variant="secondary" className="prototype-secondary-button" onClick={() => setView("detail")}>
                          返回任务详情
                        </Button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {showRewardBurst && (
                        <motion.div
                          className="prototype-success-burst"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                        >
                          <img src={glowOrnament} alt="完成特效" className="prototype-success-glow" />
                          <div className="prototype-success-card">
                            <Trophy className="h-8 w-8" />
                            <div>
                              <strong>任务完成</strong>
                              <p>第 2 环已完成，轮进度已更新，并已解锁第 3 环。</p>
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

          <div className="prototype-bottom-bar">
            <div>
              <span>大奖</span>
              <strong>完成 5 环获得福运大满贯箱</strong>
            </div>
            <Gift className="h-5 w-5" />
          </div>
        </section>
      </main>
    </div>
  );
}
