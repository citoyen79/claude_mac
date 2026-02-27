import { TodoModule, ProjectType } from '../types'

export const defaultModules: TodoModule[] = [
  {
    id: 'module-planning',
    name: '기획',
    defaultItems: [
      '요구사항 분석',
      '사용자 스토리 작성',
      '와이어프레임 작성',
      '프로토타입 검토',
    ],
  },
  {
    id: 'module-design',
    name: '디자인',
    defaultItems: [
      'UI 디자인',
      '컴포넌트 라이브러리 작성',
      '디자인 검토',
      '에셋 출력',
    ],
  },
  {
    id: 'module-development',
    name: '개발',
    defaultItems: [
      '개발 환경 설정',
      'API 설계',
      '프론트엔드 개발',
      '백엔드 개발',
      '코드 리뷰',
    ],
  },
  {
    id: 'module-testing',
    name: '테스트',
    defaultItems: [
      '단위 테스트',
      '통합 테스트',
      'QA 테스트',
      '버그 수정',
    ],
  },
  {
    id: 'module-deployment',
    name: '배포',
    defaultItems: [
      '배포 환경 설정',
      '스테이징 배포',
      '운영 배포',
      '모니터링 설정',
    ],
  },
]

export const defaultProjectTypes: ProjectType[] = [
  {
    id: 'type-web',
    name: '웹 프로젝트',
    color: '#0052cc',
    moduleIds: [
      'module-planning',
      'module-design',
      'module-development',
      'module-testing',
      'module-deployment',
    ],
  },
  {
    id: 'type-mobile',
    name: '모바일 앱',
    color: '#00875a',
    moduleIds: [
      'module-planning',
      'module-design',
      'module-development',
      'module-testing',
      'module-deployment',
    ],
  },
  {
    id: 'type-marketing',
    name: '마케팅 캠페인',
    color: '#ff5630',
    moduleIds: ['module-planning', 'module-design'],
  },
  {
    id: 'type-data',
    name: '데이터 분석',
    color: '#6554c0',
    moduleIds: ['module-planning', 'module-development', 'module-testing'],
  },
]
