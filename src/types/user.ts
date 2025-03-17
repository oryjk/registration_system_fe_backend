// 用户信息字段别名映射
export type UserInfoAlias = {
  userId: string;      // 对应 open_id
  unionId: string;     // 对应 union_id
  avatarUrl: string;   // 对应 avatar_url
  username: string;    // 保持不变
  nickname: string;    // 保持不变
  realName: string;    // 对应 real_name
  isManager: boolean;  // 对应 is_manager
  latestLoginDate: Date; // 对应 latest_login_date
};

// 原始用户信息接口
export interface UserInfoView {
  open_id: string;
  union_id: string;
  avatar_url: string;
  username: string;
  nickname: string;
  real_name: string;
  is_manager: boolean;
  latest_login_date: Date;
}

// 转换函数：将原始用户信息转换为别名格式
export function toUserInfoAlias(user: UserInfoView): UserInfoAlias {
  return {
    userId: user.open_id,
    unionId: user.union_id,
    avatarUrl: user.avatar_url,
    username: user.username,
    nickname: user.nickname,
    realName: user.real_name,
    isManager: user.is_manager,
    latestLoginDate: user.latest_login_date
  };
}

// 转换函数：将别名格式转换为原始用户信息
export function fromUserInfoAlias(userAlias: UserInfoAlias): UserInfoView {
  return {
    open_id: userAlias.userId,
    union_id: userAlias.unionId,
    avatar_url: userAlias.avatarUrl,
    username: userAlias.username,
    nickname: userAlias.nickname,
    real_name: userAlias.realName,
    is_manager: userAlias.isManager,
    latest_login_date: userAlias.latestLoginDate
  };
}