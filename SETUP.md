# Setup Instructions

## 1. Install Dependencies

```bash
npm install
```

## 2. Get Mapbox Access Token

1. Go to [https://account.mapbox.com/](https://account.mapbox.com/)
2. Sign up or log in
3. Navigate to Access Tokens
4. Copy your default public token (or create a new one)

## 3. Configure Environment

Create `.env.local` file in the project root:

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=your_actual_token_here
```

## 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Switching Map Providers (Future)

The app uses an adapter pattern for map providers. To add Google Maps:

1. Create `lib/map-providers/google-adapter.tsx`
2. Implement the `IMapProvider` interface
3. Update `components/map-view.tsx` to use the new adapter
4. Switch providers via the `MapProviderContext`

All map logic is isolated in the adapter layer - no need to change UI components.


