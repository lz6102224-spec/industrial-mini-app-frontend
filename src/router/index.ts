import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import AppLayout from '@/layout/AppLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AppLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Index.vue'),
        meta: { title: '首页概览', icon: 'Odometer' }
      },
      {
        path: 'equipment',
        name: 'Equipment',
        component: () => import('@/views/equipment/EquipmentList.vue'),
        meta: { title: '设备管理', icon: 'Cpu' }
      },
      {
        path: 'part',
        name: 'Part',
        component: () => import('@/views/part/PartList.vue'),
        meta: { title: '物料管理', icon: 'Box' }
      },
      {
        path: 'procedure',
        name: 'Procedure',
        component: () => import('@/views/procedure/ProcedureList.vue'),
        meta: { title: '工序管理', icon: 'SetUp' }
      },
      {
        path: 'plan',
        name: 'Plan',
        component: () => import('@/views/plan/PlanList.vue'),
        meta: { title: '工艺路线', icon: 'Guide' }
      },
      {
        path: 'plan/:id',
        name: 'PlanDetail',
        component: () => import('@/views/plan/PlanDetail.vue'),
        meta: { title: '工艺路线详情', hidden: true, activeMenu: '/plan' }
      },
      {
        path: 'model-graph',
        name: 'ModelGraph',
        component: () => import('@/views/model/ModelGraph.vue'),
        meta: { title: '数据模型图谱', icon: 'Share' }
      },
      {
        path: 'api-list',
        name: 'ApiList',
        component: () => import('@/views/dev/ApiList.vue'),
        meta: { title: 'xDM-F 接口清单', icon: 'Document' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.afterEach((to) => {
  const title = (to.meta?.title as string) || ''
  document.title = title ? `${title} · 工业 miniApp` : '工业 miniApp · 制造数字化管理平台'
})

export default router
