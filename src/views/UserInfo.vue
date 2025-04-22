<template>
    <div class="user-info-container">
        <h1 class="text-2xl font-bold mb-4">用户列表 (共 {{ userStore.userInfos.length }} 位)</h1>

        <div v-if="userStore.isLoading" class="loading-indicator">
            <p>正在加载用户数据...</p>
            <!-- 可以添加一个加载动画 -->
        </div>

        <div v-else-if="userStore.error" class="error-message text-red-500">
            <p>加载用户数据失败: {{ userStore.error }}</p>
        </div>

        <div v-else-if="userStore.userInfos.length > 0">
            <el-table :data="userStore.userInfos" style="width: 100%" border stripe>
                <el-table-column prop="userId" label="用户ID" width="100"></el-table-column>
                <el-table-column prop="realName" label="真实姓名" width="150">
                    <template #default="scope">
                        <el-input v-if="editingRowId === scope.row.userId" v-model="scope.row.realName"
                            size="small"></el-input>
                        <span v-else>{{ scope.row.realName }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="avatarUrl" label="头像" width="100">
                    <template #default="scope">
                        <img :src="'data:image/png;base64,' + scope.row.avatarUrl" alt="Avatar"
                            style="width: 40px; height: 40px; border-radius: 50%;" />
                    </template>
                </el-table-column>
                <el-table-column prop="isManager" label="管理员" width="100">
                    <template #default="scope">
                        <el-switch v-if="editingRowId === scope.row.userId" v-model="scope.row.isManager"
                            size="small"></el-switch>
                        <span v-else>{{ scope.row.isManager ? '是' : '否' }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="latestLoginDate" label="最近登录时间" width="200">
                    <template #default="scope">
                        {{ formatDateTime(scope.row.latestLoginDate) }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180">
                    <template #default="scope">
                        <div v-if="editingRowId === scope.row.userId">
                            <el-button size="small" type="primary" @click="saveEdit(scope.row)">保存</el-button>
                            <el-button size="small" @click="cancelEdit(scope.row)">取消</el-button>
                        </div>
                        <div v-else>
                            <el-button size="small" @click="startEdit(scope.row)">编辑</el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <div v-else>
            <p>暂无用户数据。</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useUserStore } from '../store/userStore';
import { ElTable, ElTableColumn, ElInput, ElSwitch, ElButton, ElMessage } from 'element-plus';
import type { UserInfoAlias } from '../types/user';

const userStore = useUserStore();
const editingRowId = ref<number | null>(null);
const originalRowData = ref<UserInfoAlias | null>(null);

// 组件挂载时获取用户数据
onMounted(async () => {
    await userStore.fetchUserInfos();
});

// 格式化日期时间
const formatDateTime = (dateTimeString: string | number | Date) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleString(); // 或者使用更复杂的日期格式化库，如 date-fns 或 moment
};

// 开始编辑
const startEdit = (row: UserInfoAlias) => {
    originalRowData.value = { ...row }; // 保存原始数据副本
    editingRowId.value = row.userId;
};

// 保存编辑
const saveEdit = async (row: UserInfoAlias) => {
    try {
        // TODO: 调用 userStore 中的更新方法
        // await userStore.updateUserInfo(row);
        console.log('保存用户信息:', row); // 临时打印
        ElMessage.success('用户信息更新成功');
        editingRowId.value = null;
        originalRowData.value = null;
    } catch (error) {
        ElMessage.error('更新用户信息失败: ' + error);
        // 可选：如果更新失败，恢复原始数据
        cancelEdit(row);
    }
};

// 取消编辑
const cancelEdit = (row: UserInfoAlias) => {
    if (originalRowData.value) {
        // 恢复原始数据
        Object.assign(row, originalRowData.value);
    }
    editingRowId.value = null;
    originalRowData.value = null;
};

</script>

<style scoped>
.user-info-container {
    background-color: #f9fafb; /* 淡灰色背景 */
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 添加轻微阴影 */
}

.loading-indicator,
.error-message {
    text-align: center;
    padding: 40px 20px;
    color: #666;
}

.error-message {
    color: #ef4444; /* 红色错误提示 */
}

/* Element Plus Table 样式覆盖 */
:deep(.el-table) {
    border-radius: 6px; /* 表格圆角 */
    overflow: hidden; /* 确保圆角生效 */
}

:deep(.el-table th) {
    background-color: #e5e7eb; /* 表头背景色 */
    color: #374151; /* 表头文字颜色 */
    font-weight: 600;
}

:deep(.el-table td, .el-table th) {
    padding: 12px 10px; /* 单元格内边距 */
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
    background-color: #f3f4f6; /* 斑马纹颜色 */
}

:deep(.el-table .cell) {
    line-height: 1.5; /* 单元格行高 */
}

:deep(.el-button) {
    margin-right: 5px; /* 按钮间距 */
}

img {
    vertical-align: middle; /* 头像垂直居中 */
}
</style>