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
  icon: string; // Lucide icon name or simple emoji
  roles: Role[];
}

export const simulatorData: Direction[] = [
  {
    id: 'sales',
    title: 'Продажи',
    icon: '💼',
    roles: [
      {
        id: 'sales-manager',
        title: 'Менеджер по продажам',
        description: 'Работа с холодными лидами и возражениями.',
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
      }
    ]
  },
  {
    id: 'hr',
    title: 'HR',
    icon: '👥',
    roles: [
      {
        id: 'recruiter',
        title: 'Рекрутер',
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
      }
    ]
  },
  {
    id: 'marketing',
    title: 'Маркетинг',
    icon: '📢',
    roles: [
      {
        id: 'content-manager',
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
      }
    ]
  }
];
