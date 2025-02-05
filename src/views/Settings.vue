<template>
  <div class="page-container">
    <h1 class="text-2xl font-bold mb-6">系统设置</h1>
    <el-form label-width="120px">
      <el-form-item label="系统主题">
        <el-color-picker />
      </el-form-item>
      <el-form-item label="通知提醒">
        <el-switch />
      </el-form-item>
      <el-form-item>
        <el-button type="primary">保存设置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>