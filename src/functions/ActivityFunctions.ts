export const activityFunctions = () => {
  const cacheKey = 'competitionsData'; // 定义一个缓存键
  // 创建新比赛后清除缓存的函数 (在创建新比赛的逻辑中调用)
  const clearCompetitionsCache = () => {
    localStorage.removeItem(cacheKey);
    console.log('比赛数据缓存已清除');
  };
  return {
    clearCompetitionsCache
  };
}

