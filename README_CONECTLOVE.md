# ConectLove - App de Encontros

App React Native CLI com navegação por tabs e funcionalidade de swipe para perfis.

## 🚀 Funcionalidades

- **Navegação por Tabs**: 6 telas principais (Início, Perfil, Conversar, Matchs, Planos, Configurações)
- **Swipe de Perfis**: Interface similar ao Tinder com gestos de swipe
- **Cards Centralizados**: Fotos com proporção 3:4 e crop centralizado
- **Botões de Ação**: ✖️ ↩️ ⭐ ❤️ ⚡ para interagir com perfis
- **Mock de Dados**: Perfis de exemplo para teste

## 📱 Estrutura do Projeto

```
src/
├── navigation/
│   └── RootNavigator.tsx    # Navegação principal
├── screens/
│   ├── InicioScreen.tsx     # Tela principal com swipe
│   ├── PerfilScreen.tsx     # Perfil do usuário
│   ├── ConversarScreen.tsx  # Conversas
│   ├── MatchsScreen.tsx     # Matches
│   ├── PlanosScreen.tsx     # Planos premium
│   └── ConfigScreen.tsx     # Configurações
├── ui/
│   ├── ProfileCard.tsx      # Card de perfil centralizado
│   └── ActionBar.tsx        # Barra de ações
├── shared/
│   └── mock.ts             # Dados mock
└── services/
    └── localStore.ts       # Serviços stub para backend
```

## 🛠️ Tecnologias Utilizadas

- **React Native CLI** (0.73+)
- **React Navigation** (v6)
- **react-native-deck-swiper** (gestos de swipe)
- **react-native-gesture-handler** (gestos nativos)
- **TypeScript** (tipagem)

## 🎯 Como as Fotos Ficam Centralizadas

O `ProfileCard` usa:
- `aspectRatio: 3/4` para proporção consistente
- `resizeMode: "cover"` para crop centralizado
- `alignSelf: 'center'` para centralização horizontal
- `overflow: 'hidden'` para bordas arredondadas
- `imageStyle.borderRadius` para bordas na imagem

## 🚀 Como Executar

### Android
```bash
npm run android
# ou
npx react-native run-android
```

### iOS (macOS)
```bash
npx pod-install
npm run ios
```

### Metro Bundler
```bash
npm start -- --reset-cache
```

## 🔧 Configurações Importantes

### Android
- MainActivity já configurada para ReactActivity
- react-native-gesture-handler linka automaticamente

### Babel
- Configuração simples sem reanimated/plugin
- Evita erros de worklets modernas

## 📋 Próximos Passos

1. **Backend Integration**:
   - Substituir `MOCK_PROFILES` por API real
   - Implementar `saveLike`, `savePass`, `checkMatch`
   - Conectar com Firebase/AWS/MySQL

2. **Funcionalidades**:
   - Sistema de matches
   - Chat em tempo real
   - Upload de fotos
   - Geolocalização
   - Notificações push

3. **Melhorias UX**:
   - Animações mais suaves
   - Loading states
   - Error handling
   - Offline support

## 🐛 Troubleshooting

Se aparecer erro do gesture-handler:
```bash
npm start -- --reset-cache
# Reabra o app
```

Para limpar cache completo:
```bash
npx react-native start --reset-cache
cd android && ./gradlew clean && cd ..
```

## 📄 Licença

MIT License - Veja LICENSE para detalhes.
