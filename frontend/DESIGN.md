---
version: alpha
name: GoKwik
description: >-
  WhatsApp marketing platform enabling D2C brands to transform one-time buyers into loyal customers through intelligent
  customer engagement and retention.
logo:
  src: https://gokwik.co/gokwik/svg/logo.svg
colors:
  surface: '#ffffff'
  surface-dim: '#f8f7f3'
  surface-bright: '#ffffff'
  surface-container-lowest: '#f2f1ea'
  surface-container-low: '#f8f7f3'
  surface-container: '#fef1de'
  surface-container-high: '#f2f1ea'
  surface-container-highest: '#e2e8f0'
  on-surface: '#000000'
  on-surface-variant: '#696969'
  inverse-surface: '#1e1e1e'
  inverse-on-surface: '#ffffff'
  outline: '#dedede'
  outline-variant: '#d6d6d6'
  surface-tint: '#ff8000'
  primary: '#ff8000'
  on-primary: '#ffffff'
  primary-container: '#ff9933'
  on-primary-container: '#ffffff'
  inverse-primary: '#ff9933'
  secondary: '#0779ff'
  on-secondary: '#ffffff'
  secondary-container: '#3d9aff'
  on-secondary-container: '#ffffff'
  tertiary: '#bd9964'
  on-tertiary: '#ffffff'
  tertiary-container: '#f09819'
  on-tertiary-container: '#ffffff'
  error: '#e53e3e'
  on-error: '#ffffff'
  error-container: '#fc8181'
  on-error-container: '#000000'
  primary-fixed: '#ff9933'
  primary-fixed-dim: '#e67300'
  on-primary-fixed: '#ffffff'
  on-primary-fixed-variant: '#ffffff'
  secondary-fixed: '#3d9aff'
  secondary-fixed-dim: '#0561cc'
  on-secondary-fixed: '#ffffff'
  on-secondary-fixed-variant: '#ffffff'
  tertiary-fixed: '#f09819'
  tertiary-fixed-dim: '#bd9964'
  on-tertiary-fixed: '#ffffff'
  on-tertiary-fixed-variant: '#ffffff'
  background: '#ffffff'
  on-background: '#000000'
  surface-variant: '#f2f1ea'
typography:
  display:
    fontFamily: BDO Grotesk, Inter, system-ui, sans-serif
    fontSize: 64px
    fontWeight: '300'
    lineHeight: 72px
    letterSpacing: '-0.02em'
  headline-lg:
    fontFamily: BDO Grotesk, Inter, system-ui, sans-serif
    fontSize: 52px
    fontWeight: '300'
    lineHeight: 60px
    letterSpacing: '-0.015em'
  headline-md:
    fontFamily: BDO Grotesk, Inter, system-ui, sans-serif
    fontSize: 42px
    fontWeight: '400'
    lineHeight: 50px
    letterSpacing: '-0.01em'
  title-lg:
    fontFamily: BDO Grotesk, Inter, system-ui, sans-serif
    fontSize: 36px
    fontWeight: '500'
    lineHeight: 44px
  body-lg:
    fontFamily: PP Neue Montreal, Inter, system-ui, sans-serif
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: PP Neue Montreal, Inter, system-ui, sans-serif
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: BDO Grotesk, Inter, system-ui, sans-serif
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: BDO Grotesk, Inter, system-ui, sans-serif
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 4px
  DEFAULT: 8px
  md: 12px
  lg: 16px
  xl: 24px
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  container-max: 1280px
elevation:
  sm: 0 1px 2px rgba(0, 0, 0, 0.05)
  md: 0 3px 8px rgba(0, 0, 0, 0.15)
  lg: 0 10px 15px rgba(0, 0, 0, 0.1)
layout:
  containerMaxWidth: 1280px
  gridColumns: 12
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    typography: '{typography.label-md}'
    rounded: '{rounded.full}'
    padding: 12px 32px
    height: 48px
    boxShadow: 0 3px 8px rgba(255, 128, 0, 0.2)
  button-primary-hover:
    backgroundColor: '{colors.primary-fixed-dim}'
    boxShadow: 0 6px 16px rgba(230, 115, 0, 0.25)
  button-primary-active:
    backgroundColor: '{colors.primary-fixed-dim}'
    transform: scale(0.98)
  button-secondary:
    backgroundColor: transparent
    textColor: '{colors.primary}'
    typography: '{typography.label-md}'
    rounded: '{rounded.full}'
    padding: 12px 32px
    height: 48px
    border: 2px solid {colors.primary}
  button-secondary-hover:
    backgroundColor: '{colors.surface-container}'
    borderColor: '{colors.primary-fixed-dim}'
  card:
    backgroundColor: '{colors.surface-dim}'
    rounded: '{rounded.lg}'
    padding: '{spacing.md}'
    boxShadow: '{elevation.md}'
    border: 1px solid {colors.outline}
  card-hover:
    backgroundColor: '{colors.surface-container}'
    boxShadow: '{elevation.lg}'
    transform: translateY(-2px)
  input-field:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.on-surface}'
    typography: '{typography.body-md}'
    rounded: '{rounded.md}'
    padding: '{spacing.sm}'
    border: 1px solid {colors.outline}
    height: 44px
  input-field-focus:
    borderColor: '{colors.primary}'
    boxShadow: 0 0 0 3px rgba(255, 128, 0, 0.1)
  badge:
    backgroundColor: '{colors.tertiary-container}'
    textColor: '{colors.on-tertiary-container}'
    typography: '{typography.label-sm}'
    rounded: '{rounded.full}'
    padding: 4px 12px
    display: inline-block
  list-item:
    backgroundColor: transparent
    rounded: '{rounded.md}'
    padding: '{spacing.sm}'
    textColor: '{colors.on-surface}'
  list-item-hover:
    backgroundColor: '{colors.surface-container-high}'
    textColor: '{colors.primary}'
  divider:
    backgroundColor: '{colors.outline}'
    height: 1px
    margin: '{spacing.md} 0'
---

## Overview

GoKwik is a WhatsApp-native customer engagement platform designed for D2C brands seeking to maximize customer lifetime value through intelligent retention marketing. The brand embodies a "Warm Minimalism" aesthetic—combining the approachability of cream and gold tones with the precision of deep navy accents and vibrant orange CTAs. The interface conveys trustworthiness and efficiency, transforming complex customer journey data into intuitive, actionable dashboards. The emotional response is one of clarity and empowerment: users feel in control of their customer relationships, never overwhelmed.

GoKwik's voice is direct, data-driven, and optimistic. The brand speaks to ambitious D2C operators in language that balances technical credibility with human warmth. Vocabulary favors concrete metrics ("360 tickets resolved", "1,200 total contacts") over abstract promises. The tone is conversational but never casual—think of a trusted analytics advisor who celebrates wins and provides clear next steps. Example sentence in brand voice: "Your AI Insights dashboard shows a 95% open rate on this campaign—here's how to convert that engagement into repeat orders."

## Colors

GoKwik's color system is built on a foundation of warm, inviting neutrals anchored by two complementary accent colors. **Primary (#FF8000)** is the signature brand orange—vibrant, energetic, and unmissable on call-to-action buttons, links, and interactive states. It conveys urgency and opportunity, appearing on the "BOOK A DEMO" button and throughout the dashboard UI. **Secondary (#0779FF)** is a confident medium blue used for secondary actions, data visualizations, and informational elements; it provides visual contrast without competing for attention. **Tertiary (#BD9964)** is a warm bronze-gold used for badges, highlights, and premium content callouts, reinforcing the brand's premium positioning.

The surface stack uses warm, off-white tones: surface (#FFFFFF) for primary content areas,

## Typography

GoKwik employs a two-typeface system: **BDO Grotesk** (300–600 weight) for all headings and UI labels, delivering a modern, geometric precision that reinforces the brand's technical credibility; **PP Neue Montreal** for body copy, providing warmth and legibility at smaller sizes. The type hierarchy is deliberately restrained—display (64px, 300 weight) is reserved for hero headlines, while headline-lg (52px, 300 weight) anchors section titles. Body text sits at 16–20px with 1.5 line-height (24–28px) to ensure comfortable reading on mobile and desktop. Labels use 12–14px with 0.01em letter-spacing to add subtle sophistication to buttons and badges. All interactive text (buttons, links) receives a 0.01em letter-spacing boost and 600 weight minimum to ensure legibility and visual prominence. O

## Layout

GoKwik uses a 12-column fluid grid with a 1280px container max-width, scaling responsively down to 640px on mobile. The page rhythm is built on a 40px (lg) section spacing scale, creating generous breathing room between major content blocks (hero, trust section, feature cards, CTA). Gutter width is fixed at 24px on desktop, reducing to 12px on tablet and mobile. White-space is treated as a design element—the cream-toned background (#F8F7F3) is never fully occupied, allowing content to feel curated rather than crowded. Cards and containers use md (12px) or lg (16px) border-radius with consistent 24px internal padding (md spacing), creating a cohesive rhythm. The layout prioritizes mobile-first stacking: hero text and imagery stack vertically on mobile, then shift to a 2-column or 3-column g

## Elevation & Depth

Depth in GoKwik is conveyed through subtle shadows and layering, never through darkness or blur. The elevation system uses three levels: **Level 1 (Base)** has no shadow—flat surfaces like input fields and list items sit flush on the surface. **Level 2 (Standard Card)** applies box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15), creating a gentle lift that separates cards from the background. **Level 3 (Elevated/Hover)** uses box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1) combined with a 2px upward transform (translateY(-2px)) to signal interactivity. Interactive elements (buttons, links) receive a primary

## Shapes

GoKwik employs a **Geometric Warmth** shape philosophy—combining sharp, technical corners with generous, human-friendly rounding. Buttons and primary CTAs use full (9999px) border-radius, creating pill-shaped forms that feel approachable and clickable. Cards and containers use lg (16px) radius, balancing modernity with approachability. Input fields and smaller UI elements use md (12px) radius. This graduated approach ensures that the most interactive elements (buttons) feel the most inviting, while structural containers (cards) maintain a slightly more formal presence. The full-radius buttons

## Components

### Action Elements
Buttons are the primary interaction pattern. **button-primary** uses full (9999px) radius, 48px height, 12px 32px padding, primary orange background (#FF8000), white text, and a warm shadow (0 3px 8px rgba(255, 128, 0, 0.2)). On hover, the background shifts to primary-fixed-dim (#E67300) and the shadow intensifies to 0 6px 16px rgba(230, 115, 0, 0.25), with a 200ms cubic-bezier(0.4, 0, 0.2, 1) transition. On active/click, apply transform: scale(0.98) for tactile feedback. **button-secondary** mirrors the primary button's dimensions and radius but uses a transparent background with a 2px primary-colored border and primary text; on hover, the background becomes surface-container (#FEF1DE) while the border darkens to primary-fixed-dim (#E67300).

### Containers & Surfaces

## Do's and Don'ts

**Do**
- Do use primary orange (#FF8000) exclusively for primary CTAs and high-priority interactive elements—it's the brand's signature and must remain distinctive.
- Do maintain the full (9999px) border-radius on all buttons to reinforce the approachable, human-centered brand personality.
- Do apply the warm shadow (0 3px 8px rgba(255, 128, 0, 0.2)) to interactive elements to create visual cohesion and signal clickability.
- Do use BDO Grotesk at 300–400 weight for headlines to maintain the geometric, modern aesthetic—never use serif or script fonts.
- Do preserve generous white-space (lg spacing, 40px) between major sections to avoid visual clutter and maintain the premium positioning.
- Do apply focus states with primary-tinted shadows (0 0 0 3px rgba(255, 128, 0, 0.1)) on all form inputs for accessibility and visual feedback.

**Don't**
- Don't use secondary blue (#0779FF) or tertiary bronze (#BD9964) on primary CTAs—these are supporting colors and will dilute the brand's visual identity.
- Don't apply drop shadows exceeding 15px blur radius; GoKwik's elevation system favors precision and subtlety over drama.
- Don't use sharp corners (0px radius) on buttons or cards—the Geometric Warmth philosophy requires at least md (12px) rounding.
- Don't mix BDO Grotesk and PP Neue Montreal in the same heading or label; maintain clear separation: BDO for UI/headings, PP for body copy only.
- Don't reduce padding below sm (12px) on cards or containers—the layout relies on generous internal spacing to feel premium and uncluttered.
- Don't use pure black (#000000) text on primary orange backgrounds; always use white (#FFFFFF) on-primary for maximum contrast and readability.
