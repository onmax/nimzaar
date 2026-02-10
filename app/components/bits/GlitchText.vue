<template>
  <div :class="computedClasses" :style="inlineStyles" :data-text="children">
    {{ children }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CSSProperties } from 'vue'

interface GlitchTextProps {
  children: string;
  speed?: number;
  enableShadows?: boolean;
  enableOnHover?: boolean;
  className?: string;
}

interface CustomCSSProperties extends CSSProperties {
  '--after-duration': string;
  '--before-duration': string;
  '--after-shadow': string;
  '--before-shadow': string;
}

const props = withDefaults(defineProps<GlitchTextProps>(), {
  speed: 0.5,
  enableShadows: true,
  enableOnHover: false,
  className: ''
});

const inlineStyles = computed(
  (): CustomCSSProperties => ({
    '--after-duration': `${props.speed * 3}s`,
    '--before-duration': `${props.speed * 2}s`,
    '--after-shadow': props.enableShadows ? '-2px 0 red' : 'none',
    '--before-shadow': props.enableShadows ? '2px 0 cyan' : 'none'
  })
);

const computedClasses = computed(() => {
  const classes = ['glitch-text']
  classes.push(props.enableOnHover ? 'glitch-text--hover' : 'glitch-text--auto')
  if (props.className) classes.push(props.className)
  return classes.join(' ')
})
</script>

<style scoped>
.glitch-text {
  position: relative;
  display: inline-block;
}

.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  background: inherit;
  color: inherit;
  clip-path: inset(0 0 0 0);
}

.glitch-text::before {
  transform: translateX(-2px);
  text-shadow: var(--before-shadow);
  animation: glitch-clip var(--before-duration) infinite linear alternate-reverse;
}

.glitch-text::after {
  transform: translateX(2px);
  text-shadow: var(--after-shadow);
  animation: glitch-clip var(--after-duration) infinite linear alternate-reverse;
}

.glitch-text--hover::before,
.glitch-text--hover::after {
  opacity: 0;
  animation: none;
}

.glitch-text--hover:hover::before {
  opacity: 1;
  animation: glitch-clip var(--before-duration) infinite linear alternate-reverse;
}

.glitch-text--hover:hover::after {
  opacity: 1;
  animation: glitch-clip var(--after-duration) infinite linear alternate-reverse;
}

@keyframes glitch-clip {
  0% {
    clip-path: inset(20% 0 50% 0);
  }
  5% {
    clip-path: inset(10% 0 60% 0);
  }
  10% {
    clip-path: inset(15% 0 55% 0);
  }
  15% {
    clip-path: inset(25% 0 35% 0);
  }
  20% {
    clip-path: inset(30% 0 40% 0);
  }
  25% {
    clip-path: inset(40% 0 20% 0);
  }
  30% {
    clip-path: inset(10% 0 60% 0);
  }
  35% {
    clip-path: inset(15% 0 55% 0);
  }
  40% {
    clip-path: inset(25% 0 35% 0);
  }
  45% {
    clip-path: inset(30% 0 40% 0);
  }
  50% {
    clip-path: inset(20% 0 50% 0);
  }
  55% {
    clip-path: inset(10% 0 60% 0);
  }
  60% {
    clip-path: inset(15% 0 55% 0);
  }
  65% {
    clip-path: inset(25% 0 35% 0);
  }
  70% {
    clip-path: inset(30% 0 40% 0);
  }
  75% {
    clip-path: inset(40% 0 20% 0);
  }
  80% {
    clip-path: inset(20% 0 50% 0);
  }
  85% {
    clip-path: inset(10% 0 60% 0);
  }
  90% {
    clip-path: inset(15% 0 55% 0);
  }
  95% {
    clip-path: inset(25% 0 35% 0);
  }
  100% {
    clip-path: inset(30% 0 40% 0);
  }
}
</style>
