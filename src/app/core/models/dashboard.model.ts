export interface StatsCard {
    title: string;
    value: string | number;
    icon: string;
    change?: string;
    changeType?: 'increase' | 'decrease';
  }
  
  export interface RecentTicket {
    id: number;
    subject: string;
    status: 'Pendiente' | 'En progreso' | 'Resuelto';
    priority: 'Alta' | 'Media' | 'Baja';
    date: Date;
  }
  
  export interface UserActivity {
    user: {
      name: string;
      email: string;
      role: 'Admin' | 'Técnico' | 'Usuario';
    };
    action: string;
    time: Date;
  }
  
  export interface EquipmentStatus {
    operational: number;
    maintenance: number;
    outOfService: number;
  }