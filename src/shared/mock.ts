export type Profile = { id:string; name:string; age:number; bio:string; distanceKm:number; photo:string; };

export const MOCK_PROFILES: Profile[] = [
  { id:'1',  name:'João',   age:24, bio:'Artista, música é minha vibe.', distanceKm:32, photo:'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=1200&auto=format&fit=crop' },
  { id:'2',  name:'Ana',    age:22, bio:'Trilhas + café. Bora aventura?', distanceKm:12, photo:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop' },
  { id:'3',  name:'Marcos', age:27, bio:'Dev mobile e pizza aos sábados.', distanceKm:8,  photo:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop' },
  { id:'4',  name:'Bianca', age:25, bio:'Fotografia e beach tennis.', distanceKm:5, photo:'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop' },
  { id:'5',  name:'Rafa',   age:29, bio:'Cozinho bem e rio fácil.', distanceKm:18, photo:'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=1200&auto=format&fit=crop' },
  { id:'6',  name:'Lívia',  age:23, bio:'Coleciono cafés e pôr-do-sol.', distanceKm:11, photo:'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop' },
  { id:'7',  name:'Pedro',  age:28, bio:'Maratonista de séries.', distanceKm:9,  photo:'https://images.unsplash.com/photo-1541534401786-2077eed87a72?q=80&w=1200&auto=format&fit=crop' },
  { id:'8',  name:'Sofia',  age:26, bio:'UX e mãe de plantas.', distanceKm:7,  photo:'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop' },
  { id:'9',  name:'Lucas',  age:24, bio:'Surf e violão.', distanceKm:21, photo:'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=1200&auto=format&fit=crop' },
  { id:'10', name:'Carla',  age:30, bio:'Produtora de eventos.', distanceKm:15, photo:'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=1200&auto=format&fit=crop' },
  { id:'11', name:'Thiago', age:25, bio:'Dados & café passado.', distanceKm:10, photo:'https://images.unsplash.com/photo-1502767089025-6572583495b0?q=80&w=1200&auto=format&fit=crop' },
  { id:'12', name:'Nina',   age:22, bio:'Gatos, livros e caminhadas.', distanceKm:4, photo:'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop' },
  { id:'13', name:'Diego',  age:31, bio:'Cerveja artesanal e bike.', distanceKm:27, photo:'https://images.unsplash.com/photo-1541534401786-2077eed87a72?q=80&w=1200&auto=format&fit=crop' },
  { id:'14', name:'Luisa',  age:24, bio:'Marketing e dança.', distanceKm:6, photo:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop' },
  { id:'15', name:'Henrique',age:26,bio:'Jogos e culinária.', distanceKm:13, photo:'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=1200&auto=format&fit=crop' },
  { id:'16', name:'Paula',  age:28, bio:'Pilates e viagens curtas.', distanceKm:19, photo:'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop' },
  { id:'17', name:'Gustavo',age:23,bio:'Estudante de cinema.', distanceKm:14, photo:'https://images.unsplash.com/photo-1541534401786-2077eed87a72?q=80&w=1200&auto=format&fit=crop' },
  { id:'18', name:'Camila', age:27, bio:'Pintura e museus.', distanceKm:16, photo:'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=1200&auto=format&fit=crop' },
  { id:'19', name:'Vini',   age:25, bio:'Skate e front-end.', distanceKm:20, photo:'https://images.unsplash.com/photo-1502767089025-6572583495b0?q=80&w=1200&auto=format&fit=crop' },
  { id:'20', name:'Clara',  age:21, bio:'Biomed e dogs.', distanceKm:3,  photo:'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop' },
];

export const MOCK_CHATS = [
  {id:'c1', name:'Ana',    last:'Oi! Curti seu perfil 😊', time:'21:03'},
  {id:'c2', name:'Marcos', last:'Bora pizza sábado?',     time:'20:11'},
  {id:'c3', name:'Bianca', last:'Amei suas fotos!',       time:'18:47'},
  {id:'c4', name:'Lucas',  last:'Partiu praia domingo?',  time:'16:22'},
];

export const MOCK_MATCHS = [
  {id:'m1', name:'Ana',    photo:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop'},
  {id:'m2', name:'Bianca', photo:'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop'},
  {id:'m3', name:'Marcos', photo:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop'},
  {id:'m4', name:'Lucas',  photo:'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=600&auto=format&fit=crop'},
];
