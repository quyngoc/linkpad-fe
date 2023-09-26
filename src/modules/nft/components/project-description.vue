<template>
  <div>
    <v-row no-gutters>
      <v-col md="3" v-if="$vuetify.breakpoint.mdAndUp">
        <aside class="sticky">
          <!-- <transition-group name="list" tag="ol" ref="links"> -->
          <div v-for="(item, index) in activeHeadings()" :key="index">
            <a
              @click="e => handleLinkClick(e, item.id)"
              :href="item.id"
              :class="{
                'is-active': item.id === visibleId,
                inactive: item.id !== visibleId
              }"
            >
              <div class="font-weight-bold">{{ `${index + 1}. ${item.text}` }}</div>
              <v-divider class="my-4"></v-divider>
            </a>
          </div>
          <!-- </transition-group> -->
        </aside>
      </v-col>
      <v-col md="9" sm="12">
        <div id="scrollArea" v-html="compiledMarkdown()" ref="content" class="pa-4"></div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { Observer } from 'mobx-vue'
import { Component, Vue, Watch } from 'vue-property-decorator'
import { marked } from 'marked'

@Observer
@Component({
  components: {}
})
export default class ProjectDescription extends Vue {
  input = '# Loading...'
  visibleId = ''
  previousVisibleId = ''
  mdLength = 0
  headings = []

  @Watch('mdLength', { immediate: true }) async onAvatarChanged() {
    this.findHeadings()
  }

  async created() {
    // const url =
    //   'https://gist.githubusercontent.com/lisilinhart/e9dcf5298adff7c2c2a4da9ce2a3db3f/raw/2f1a0d47eba64756c22460b5d2919d45d8118d42/red_panda.md'
    const url = 'https://gateway.pinata.cloud/ipfs/QmeP5zUXjHycm87kgb8mSwnATjku7xJBLr8UUruU4HxKZ4'
    const response = await fetch(url)
    const data = await response.text()
    this.input = data
  }

  mounted() {
    const options = {
      rootMargin: '0px 0px 0px 0px',
      threshold: 1
    }
    const debouncedFunction = this.handleObserver
    this.observer = new IntersectionObserver(debouncedFunction, options)
    this.motionQuery = window.matchMedia('(prefers-reduced-motion)')
  }

  compiledMarkdown() {
    const htmlFromMarkdown = marked(this.input, { sanitize: true })
    this.mdLength = htmlFromMarkdown.length
    return htmlFromMarkdown
  }
  findHeadings() {
    if (this.observer) {
      this.headings = [...this.$refs.content.querySelectorAll('[id]')]
      this.headings.map(heading => this.observer.observe(heading))
    }
  }
  slugify(text) {
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
  }
  getRelated(item) {
    if (item) {
      const items = this.compiledHeadings()
      const currentIdx = items.indexOf(item)
      let idx = 0

      // find the correct (parent) index
      if (item.depth === 1) {
        idx = currentIdx + 1
      } else {
        // find parent index
        let found = false
        for (let j = currentIdx; j >= 0; j--) {
          if (items[j].depth === 1 && !found) {
            idx = j + 1
            found = true
          }
        }
      }

      const children = []
      let isSameLevel = true
      for (idx; idx < items.length; idx++) {
        if (items[idx].depth === 2 && isSameLevel) {
          children.push(items[idx])
        } else if (items[idx].depth === 1) {
          isSameLevel = false
        }
      }
      return children
    }
  }

  compiledHeadings() {
    const regexString = /#(.*)/g
    const found = this.input.match(regexString)
    const headings = found.map(item => {
      const depth = (item.match(/#/g) || []).length
      const text = item.replace(/#/gi, '', '').trim()
      return {
        depth,
        id: `#${this.slugify(text)}`,
        text
      }
    })
    return headings
  }
  activeHeadings() {
    // const activeItem = this.compiledHeadings().find(item => item.id === this.visibleId)
    // const relatedItems = this.getRelated(activeItem) || []
    return this.compiledHeadings().filter(item => item.depth === 1)
  }

  // eslint-disable-next-line
  handleObserver(entries, observer) {
    entries.forEach(entry => {
      const { target, isIntersecting, intersectionRatio } = entry
      if (isIntersecting && intersectionRatio >= 1 && target.nodeName === 'H1') {
        this.visibleId = `#${target.getAttribute('id')}`
      }
    })
  }

  handleLinkClick(evt, itemId) {
    evt.preventDefault()
    const id = itemId.replace('#', '')
    const section = this.headings.find(heading => heading.getAttribute('id') === id)
    section.setAttribute('tabindex', -1)
    section.focus()
    this.visibleId = itemId

    window.scroll({
      behavior: this.motionQuery.matches ? 'instant' : 'smooth',
      top: section.offsetTop - 20,
      block: 'start'
    })
  }

  debounce(func, timeout = 300) {
    let timer
    return (...args) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        func.apply(this, args)
      }, timeout)
    }
  }
}
</script>

<style scoped lang="scss">
h1,
h2,
h3,
h4,
h5 {
  font-family: 'Oswald', sans-serif;
  margin: 2.75rem 0 1.05rem;
  font-weight: 400;
  line-height: 1.15;
}

h1 {
  font-size: 3.052em;
}

h2 {
  font-size: 2.441em;
}

h3 {
  font-size: 1.953em;
}

h4 {
  font-size: 1.563em;
}

h5 {
  font-size: 1.25em;
}

small,
.text_small {
  font-size: 0.8em;
}

.is-active {
  font-weight: 700;
  color: #f7ce2a !important;
  text-decoration: underline;
}

.inactive {
  color: #8c8c8c !important;
}

.is-child {
  padding-left: 1em;
}

.list-leave-active,
.list-move {
  transition: transform 0.8s, opacity 0.4s;
}

.list-enter-active {
  transition: transform 0.8s ease 0.4s, opacity 0.4s ease 0.4s;
}

.list-enter,
.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.list-leave-active {
  position: absolute;
}

.sticky {
  position: sticky;
  top: 80px;
}
</style>
