export type TaskLevel = 'basic' | 'medium' | 'advanced';

export interface SimulatorTask {
  id: string;
  level: TaskLevel;
  context: string; // Ситуация/Бриф
  objective: string; // Что нужно сделать
  format: string; // Ожидаемый формат результата
  benchmarkMinutes: number; // Время выполнения человеком без ИИ
}

export interface Role {
  id: string;
  title: string;
  description: string;
  tasks: SimulatorTask[];
}

export interface Direction {
  id: string;
  title: string;
  icon: string; // Simple emoji
  roles: Role[];
}

export const simulatorData: Direction[] = [
  {
    id: 'sales',
    title: 'Продажи',
    icon: '💼',
    roles: [
      {
        id: 'sales-b2b',
        title: 'Менеджер B2B',
        description: 'Оптовые продажи и работа с корпоративными клиентами.',
        tasks: [
          {
            id: 'task-1',
            level: 'basic',
            context: 'У вас есть список из 10 потенциальных клиентов, которые оставили заявку на сайте, но не отвечают на звонки.',
            objective: 'Составить персонализированную цепочку из 3-х писем для дожима клиентов, используя данные об их интересах.',
            format: 'Текстовый файл с письмами',
            benchmarkMinutes: 45
          }
        ]
      },
      { id: 'sales-b2c', title: 'Менеджер B2C', description: 'Работа с частными клиентами и розничными продажами.', tasks: [] },
      { id: 'sales-account', title: 'Аккаунт-менеджер', description: 'Поддержание и развитие отношений с текущими клиентами.', tasks: [] },
      { id: 'sales-rop', title: 'РОП', description: 'Руководитель отдела продаж: управление и стратегия.', tasks: [] }
    ]
  },
  {
    id: 'marketing',
    title: 'Маркетинг',
    icon: '📢',
    roles: [
      { id: 'mark-digital', title: 'Digital-маркетолог', description: 'Управление рекламными кампаниями в сети.', tasks: [] },
      {
        id: 'mark-content',
        title: 'Контент-менеджер',
        description: 'Создание и дистрибуция контента.',
        tasks: [
          {
            id: 'task-3',
            level: 'basic',
            context: 'Запуск нового продукта — умной колонки для детей.',
            objective: 'Разработать контент-план на неделю (7 постов) для Telegram и Instagram, включая идеи для визуалов.',
            format: 'Таблица с контент-планом',
            benchmarkMinutes: 120
          }
        ]
      },
      { id: 'mark-smm', title: 'SMM', description: 'Продвижение бренда в социальных сетях.', tasks: [] },
      { id: 'mark-seo', title: 'SEO', description: 'Поисковая оптимизация и работа с трафиком.', tasks: [] }
    ]
  },
  {
    id: 'hr',
    title: 'HR',
    icon: '👥',
    roles: [
      {
        id: 'hr-recruiter',
        title: 'HR-менеджер/рекрутер',
        description: 'Поиск и оценка талантов.',
        tasks: [
          {
            id: 'task-2',
            level: 'basic',
            context: 'Нужно найти Senior Python разработчика на сложный проект в финтех.',
            objective: 'Создать привлекательное описание вакансии и составить список из 5 нестандартных вопросов для проверки soft-skills.',
            format: 'Описание вакансии + список вопросов',
            benchmarkMinutes: 60
          }
        ]
      },
      { id: 'hr-generalist', title: 'HR-generalist', description: 'Универсальный специалист по управлению персоналом.', tasks: [] }
    ]
  },
  {
    id: 'finance',
    title: 'Финансы и бухгалтерия',
    icon: '📊',
    roles: [
      { id: 'fin-acc', title: 'Бухгалтер', description: 'Учет операций и налоговая отчетность.', tasks: [] },
      { id: 'fin-analyst', title: 'Финансовый аналитик', description: 'Анализ финансовых показателей и планирование.', tasks: [] }
    ]
  },
  {
    id: 'support',
    title: 'Клиентская поддержка',
    icon: '🎧',
    roles: [
      { id: 'supp-spec', title: 'Специалист поддержки', description: 'Помощь клиентам в решении текущих вопросов.', tasks: [] },
      { id: 'supp-claims', title: 'Менеджер по рекламациям', description: 'Работа с претензиями и сложными случаями.', tasks: [] }
    ]
  },
  {
    id: 'ops',
    title: 'Операции и администрация',
    icon: '🏢',
    roles: [
      { id: 'ops-office', title: 'Офис-менеджер', description: 'Обеспечение жизнедеятельности офиса.', tasks: [] },
      { id: 'ops-manager', title: 'Операционный менеджер', description: 'Оптимизация внутренних процессов компании.', tasks: [] }
    ]
  },
  {
    id: 'legal',
    title: 'Юристы',
    icon: '⚖️',
    roles: [
      { id: 'legal-spec', title: 'Юрист/юрисконсульт', description: 'Юридическое сопровождение деятельности.', tasks: [] }
    ]
  },
  {
    id: 'procurement',
    title: 'Закупки',
    icon: '🛒',
    roles: [
      { id: 'proc-manager', title: 'Менеджер по закупкам', description: 'Поиск поставщиков и управление закупками.', tasks: [] }
    ]
  },
  {
    id: 'it',
    title: 'IT',
    icon: '💻',
    roles: [
      { id: 'it-sysadmin', title: 'Сисадмин/поддержка', description: 'Поддержка IT-инфраструктуры.', tasks: [] },
      { id: 'it-data', title: 'Аналитик данных', description: 'Сбор и интерпретация данных.', tasks: [] }
    ]
  },
  {
    id: 'pm',
    title: 'Проектное управление',
    icon: '📅',
    roles: [
      { id: 'pm-manager', title: 'Проектный менеджер', description: 'Управление сроками, ресурсами и качеством проектов.', tasks: [] }
    ]
  },
  {
    id: 'docs',
    title: 'Документооборот',
    icon: '📄',
    roles: [
      { id: 'docs-spec', title: 'Специалист по документообороту', description: 'Организация и контроль движения документов.', tasks: [] }
    ]
  }
];
