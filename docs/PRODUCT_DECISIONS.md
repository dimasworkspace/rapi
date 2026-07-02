# Rapi — Keputusan Produk (MVP)

> Hasil interview product owner, 2 Juli 2026. Dokumen ini melengkapi CLAUDE.md + wireframe/UI kit sebagai spec MVP, sampai PRD formal tersedia di `docs/Rapi_PRD.docx`.

## Keputusan Terkunci

| # | Topik | Keputusan | Konsekuensi Teknis |
|---|---|---|---|
| 1 | **Onboarding** | Tanpa login. First-run: sapa user → minta nama panggilan → (opsional) isi saldo awal → dashboard. | Profil disimpan di LocalStorage (`userStore`). Auth beneran nyusul saat fase backend. |
| 2 | **Saldo** | Saldo awal (opsional saat onboarding) + pergerakan dari transaksi. | `saldo = saldoAwal + Σpemasukan − Σpengeluaran`. Saldo awal bisa diedit di Settings. |
| 3 | **Halaman Investasi** | Card ringkasan di Dashboard → tap → halaman Investasi penuh. | Bottom nav tetap 4 tab (Home · Laporan · Rapi AI · Profil) + FAB, sesuai UI kit. Route `/investments` di luar nav. |
| 4 | **Kategori default** | 12 kategori beremoji (lihat di bawah), user bisa tambah/edit di Settings. | Kategori jadi data di store, bukan hardcode di komponen. |
| 5 | **AI = BYOK** | User memasukkan Anthropic API key **miliknya sendiri** lewat Settings. Tanpa key: parser lokal tetap jalan penuh. | Key disimpan di LocalStorage user (tidak pernah dikirim ke server kita). Semua fitur AI harus punya fallback non-AI. |
| 6 | **Timeline** | Normal, 3–4 minggu ke MVP. | Prioritas sesuai fase di bawah. |
| 7 | **Deploy** | Vercel, dari repo GitHub `dimasworkspace/rapi`. | — |

## Kategori Default

**Pengeluaran:** 🍜 Makanan · 🚗 Transportasi · 🛍️ Belanja · 🎮 Hiburan · 📡 Tagihan · 💊 Kesehatan · 📚 Pendidikan · 🎁 Lainnya

**Pemasukan:** 💼 Gaji · 💻 Freelance · 🎉 Bonus · 💰 Lainnya

## Catatan Desain Tambahan (dari UI Kit)

- Format nominal kompak dipakai di list: `Rp 25rb`, `Rp 1,5 jt` — formatter harus dukung ribuan (`rb`) dan jutaan (`jt`).
- Metode input transaksi ditampilkan sebagai label: `via Chat AI` · `Scan Foto` · `Manual`.
- FAB Blue (54px, border Off-White 3px) melayang di kanan bawah, di atas bottom nav.
- Balance card: Navy, radius 24px, aksen lingkaran Yellow transparan.

## Fase Development

1. **Fase 0 — Fondasi**: scaffold Vite+React+TS, Tailwind (token Rapi), struktur folder, deploy pipeline.
2. **Fase 1 — Kerangka**: layout shell, komponen dasar (RapiCard, RapiButton, dll.), dashboard dummy.
3. **Fase 2 — Inti**: types, Zustand stores (persist), CRUD transaksi, parser lokal, onboarding.
4. **Fase 3 — AI**: voice input (Web Speech API), foto struk, fallback Anthropic (BYOK), Rapi AI Chat.
5. **Fase 4 — Pelengkap**: Laporan + grafik, Investasi, Settings, polish, deploy Vercel.
