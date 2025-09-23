export interface Profile {
  id?: string;
  name: string;
  age: number;
  bio?: string;
  photos: string[];
  interests: string[];
  gender: 'Masculino' | 'Feminino' | 'Outro';
  seeking: 'Masculino' | 'Feminino' | 'Ambos';
  location_mock?: string;
  is_verified?: boolean;
  user_email: string;
}

export class ProfileEntity {
  static async create(data: Profile): Promise<Profile> {
    // Mock implementation - replace with actual API calls
    const profile: Profile = {
      ...data,
      id: Date.now().toString(),
      is_verified: false,
    };
    return profile;
  }

  static async filter(filters: any): Promise<Profile[]> {
    // Mock implementation - replace with actual API calls
    const mockProfiles: Profile[] = [
      {
        id: '1',
        name: 'Ana Silva',
        age: 25,
        bio: 'Apaixonada por viagens e boa comida. Buscando conexões reais.',
        photos: ['https://i.pravatar.cc/500?u=ana1'],
        interests: ['Viagem', 'Cozinhar', 'Filmes'],
        gender: 'Feminino',
        seeking: 'Masculino',
        location_mock: '2km de distância',
        is_verified: true,
        user_email: 'ana1@example.com'
      },
      {
        id: '2',
        name: 'Carlos Santos',
        age: 28,
        bio: 'Gosto de música e esportes. Procuro alguém especial.',
        photos: ['https://i.pravatar.cc/500?u=carlos1'],
        interests: ['Música', 'Esportes', 'Tecnologia'],
        gender: 'Masculino',
        seeking: 'Feminino',
        location_mock: '5km de distância',
        is_verified: false,
        user_email: 'carlos1@example.com'
      },
      {
        id: '3',
        name: 'Maria Oliveira',
        age: 23,
        bio: 'Estudante de arte, adoro fotografia e natureza.',
        photos: ['https://i.pravatar.cc/500?u=maria1'],
        interests: ['Arte', 'Fotografia', 'Natureza'],
        gender: 'Feminino',
        seeking: 'Masculino',
        location_mock: '3km de distância',
        is_verified: true,
        user_email: 'maria1@example.com'
      },
      {
        id: '4',
        name: 'João Costa',
        age: 30,
        bio: 'Engenheiro que ama ler e cozinhar nos fins de semana.',
        photos: ['https://i.pravatar.cc/500?u=joao1'],
        interests: ['Leitura', 'Cozinhar', 'Tecnologia'],
        gender: 'Masculino',
        seeking: 'Feminino',
        location_mock: '7km de distância',
        is_verified: false,
        user_email: 'joao1@example.com'
      },
      {
        id: '5',
        name: 'Sofia Lima',
        age: 26,
        bio: 'Médica que adora dançar e conhecer novos lugares.',
        photos: ['https://i.pravatar.cc/500?u=sofia1'],
        interests: ['Dança', 'Viagem', 'Música'],
        gender: 'Feminino',
        seeking: 'Masculino',
        location_mock: '4km de distância',
        is_verified: true,
        user_email: 'sofia1@example.com'
      }
    ];

    // Apply basic filtering logic
    let filteredProfiles = mockProfiles;
    
    if (filters?.id?.nin) {
      filteredProfiles = filteredProfiles.filter(p => !filters.id.nin.includes(p.id));
    }
    
    if (filters?.gender?.eq) {
      filteredProfiles = filteredProfiles.filter(p => p.gender === filters.gender.eq);
    }
    
    return filteredProfiles;
  }

  static async bulkCreate(profiles: Profile[]): Promise<Profile[]> {
    // Mock implementation - replace with actual API calls
    return profiles;
  }
}
