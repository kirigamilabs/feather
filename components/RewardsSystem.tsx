import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Award, Gift } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  reward: number;
  completed: boolean;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  reward: number;
  progress: number;
}

export const RewardsSystem = () => {
  const [achievements, setAchievements] = React.useState<Achievement[]>([]);
  const [quests, setQuests] = React.useState<Quest[]>([]);
  const [rewardPoints, setRewardPoints] = React.useState(0);
  const [level, setLevel] = React.useState(0);

  const unlockAchievement = (id: Achievement) => {
    if (!achievements.find(a => a.id === id.id)) {
      setAchievements(prev => [...prev, id]);
      //missing celebration
    }
  };

  //missing progress bar

  const AchievementCard = ({ achievement }: { achievement: Achievement }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 rounded-lg ${
        achievement.completed ? 'bg-primary/10' : 'bg-card'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Trophy className={`w-5 h-5 ${achievement.completed ? 'text-primary' : 'text-gray-400'}`} />
          <div>
            <h3 className="font-medium">{achievement.title}</h3>
            <p className="text-sm text-muted-foreground">{achievement.description}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium">{achievement.reward} pts</span>
          <div className="mt-1 h-1 w-20 bg-background rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${achievement.progress * 100}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const QuestCard = ({ quest }: { quest: Quest }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card p-4 rounded-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-primary" />
            <h3 className="font-medium">{quest.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{quest.description}</p>
        </div>
        <Award className="w-6 h-6 text-yellow-500" />
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{(quest.progress * 100).toFixed(0)}%</span>
        </div>
        <div className="mt-1 h-1 bg-background rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${quest.progress * 100}%` }}
          />
        </div>
      </div>
    </motion.div>
  );

  const RewardsSummary = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-r from-primary/20 to-secondary/20 p-6 rounded-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{rewardPoints}</h2>
          <p className="text-sm text-muted-foreground">Total Points</p>
        </div>
        <Gift className="w-8 h-8 text-primary" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <Star className="w-5 h-5 mx-auto text-yellow-500" />
          <span className="text-sm mt-1 block">Level {Math.floor(rewardPoints / 1000)}</span>
        </div>
        <div className="text-center">
          <Trophy className="w-5 h-5 mx-auto text-primary" />
          <span className="text-sm mt-1 block">{achievements.filter(a => a.completed).length} Completed</span>
        </div>
        <div className="text-center">
          <Target className="w-5 h-5 mx-auto text-secondary" />
          <span className="text-sm mt-1 block">{quests.length} Active</span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <RewardsSummary />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Trophy className="w-5 h-5" /> Achievements
        </h2>
        <div className="space-y-3">
          {achievements.map(achievement => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Target className="w-5 h-5" /> Active Quests
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quests.map(quest => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </div>
      </div>
    </div>
  );
};