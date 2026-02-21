# Master's Schedule - ZCANIC PRO

研究生课表管理与可视化工具，基于 React + TypeScript + Vite。

## 项目现状

当前版本重点是：
- 课表查看（按周切换、移动端滑动换周）
- 课程数据编辑（可视化网格编辑 + 课程弹窗）
- CSV / Excel 导入导出
- 多视图分析（复盘统计、Metro Map、3D 视图）
- 本地持久化 + Void Drop 云端临时同步

## 主要功能

### 1) 课表与周次
- 周次范围 1-16，可用滑杆或手势切换。
- 支持课程冲突格位展示和课程详情弹窗。

### 2) 数据管理
- Data Editor 支持新增、编辑、删除课程。
- 支持 CSV 导出与 CSV/Excel 导入。
- 导入流程内置课程数据归一化与合法性校验。

### 3) 可视化分析
- **ReviewMode**：按周负载统计。
- **MetroMap**：课程关系地铁图。
- **Visualization3D**：按 day / slot / week 的 3D 体素视图。

### 4) 存储与同步
- 本地存储 key：`zcanic_courses_v7`
- Void key 存储：`zcanic_void_key`
- 启动时优先尝试 Void 云端拉取，失败后回退本地。

## 最近架构更新（2026）

- `App.tsx` 的核心副作用已拆分到 hooks：
  - `hooks/useSemesterWeek.ts`
  - `hooks/useCoursesStore.ts`
  - `hooks/useModeSwitch.ts`
- 引入 `courseValidation.ts` 统一课程数据校验/归一化。
- 重型视图已做懒加载（lazy + Suspense）以优化首屏体验。
- `ScheduleGrid` 降低了重复计算路径，减少无意义重渲染。

## 技术栈

- React 18 + TypeScript + Vite 6
- Tailwind CSS
- React Flow（Metro）
- React Three Fiber / Drei / Three.js（3D）
- Recharts（统计）
- XLSX（Excel 解析）

## 本地开发

```bash
npm install
npm run dev
```

## 质量与构建命令

```bash
# 类型检查
npm run typecheck

# 生产构建
npm run build

# 当前 test 脚本 = typecheck + build（回归烟测）
npm test
```

## 路径与目录约定

为避免根目录杂乱，当前约定如下：
- `docs/`：文档、报告、手工测试页面
- `scripts/`：开发辅助脚本（非运行时）
- `samples/`：示例输入与生成产物

相关文件：
- `docs/integrations/VOID_KV_API.md`
- `docs/reports/TEST_REPORT.md`
- `docs/manual-tests/test-void-drop.html`
- `scripts/excel/convert_to_mock.cjs`
- `scripts/excel/debug_loader.cjs`
- `scripts/excel/inspect_xlsx.cjs`
- `scripts/excel/inspect_xlsx.ts`
- `samples/xlsx/学生课表.xlsx`
- `samples/xlsx/学生课表 (1).xlsx`
- `samples/generated/metadata.json`
- `samples/generated/mock_data_output.txt`

## 目录结构（核心）

```text
.
├─ App.tsx
├─ courseValidation.ts
├─ hooks/
│  ├─ useSemesterWeek.ts
│  ├─ useCoursesStore.ts
│  └─ useModeSwitch.ts
├─ components/
│  ├─ ScheduleGrid.tsx
│  ├─ DataEditor.tsx
│  ├─ ReviewMode.tsx
│  ├─ MetroMap.tsx
│  ├─ Visualization3D.tsx
│  └─ VoidDropModal.tsx
├─ docs/
├─ scripts/
├─ samples/
└─ constants.tsx / types.ts
```

## License

MIT
