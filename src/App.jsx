import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// SafeIcon component for Lucide icons
const iconCache = {}
const SafeIcon = ({ name, size = 24, className = '', color }) => {
  const [IconComponent, setIconComponent] = useState(null)

  useEffect(() => {
    if (iconCache[name]) {
      setIconComponent(() => iconCache[name])
      return
    }

    import('lucide-react').then((module) => {
      const pascalName = name
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('')

      const Icon = module[pascalName] || module['HelpCircle']
      iconCache[name] = Icon
      setIconComponent(() => Icon)
    })
  }, [name])

  if (!IconComponent) {
    return <div style={{ width: size, height: size }} className={className} />
  }

  return <IconComponent size={size} className={className} color={color} />
}

// Web3Forms Hook
const useFormHandler = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e, accessKey) => {
    e.preventDefault()
    setIsSubmitting(true)
    setIsError(false)

    const formData = new FormData(e.target)
    formData.append('access_key', accessKey)

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
        e.target.reset()
      } else {
        setIsError(true)
        setErrorMessage(data.message || 'Что-то пошло не так')
      }
    } catch (error) {
      setIsError(true)
      setErrorMessage('Ошибка сети. Пожалуйста, попробуйте снова.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setIsSuccess(false)
    setIsError(false)
    setErrorMessage('')
  }

  return { isSubmitting, isSuccess, isError, errorMessage, handleSubmit, resetForm }
}

// Clean Map Component
const CleanMap = ({ coordinates = [37.6173, 55.7558], zoom = 12, markers = [] }) => {
  const mapContainer = useRef(null)
  const map = useRef(null)

  useEffect(() => {
    if (map.current) return

    const isDark = true

    const styleUrl = isDark
      ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
      : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: coordinates,
      zoom: zoom,
      attributionControl: false,
      interactive: true,
      dragPan: true,
      dragRotate: false,
      touchZoomRotate: false,
      doubleClickZoom: true,
      keyboard: false
    })

    map.current.scrollZoom.disable()

    if (markers && markers.length > 0) {
      markers.forEach(marker => {
        const el = document.createElement('div')
        el.style.cssText = `
          width: 24px;
          height: 24px;
          background: #E4FF47;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
        `

        new maplibregl.Marker({ element: el })
          .setLngLat([marker.lng, marker.lat])
          .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`<strong style="color:#000">${marker.title}</strong>`))
          .addTo(map.current)
      })
    } else {
      const el = document.createElement('div')
      el.style.cssText = `
        width: 24px;
        height: 24px;
        background: #E4FF47;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      `
      new maplibregl.Marker({ element: el })
        .setLngLat(coordinates)
        .addTo(map.current)
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [coordinates, zoom, markers])

  return (
    <div className="w-full h-full min-h-[300px] md:min-h-[400px] rounded-2xl overflow-hidden shadow-xl border border-zinc-800 relative">
      <style>{`
        .maplibregl-ctrl-attrib { display: none !important; }
        .maplibregl-ctrl-logo { display: none !important; }
        .maplibregl-compact { display: none !important; }
      `}</style>
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  )
}

// Scroll animation wrapper
const ScrollReveal = ({ children, delay = 0, direction = 'up' }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 60 : 0,
      x: direction === 'left' ? -60 : direction === 'right' ? 60 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
    }
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{ duration: 0.8, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )
}

// Portfolio projects data
const portfolioProjects = [
  {
    id: 1,
    title: 'НЕБОСКРЕБ APEX',
    category: 'Коммерческая архитектура',
    year: '2024',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
    description: 'Многофункциональный комплекс премиум-класса в деловом центре города. Геометричный фасад с динамическими линиями.'
  },
  {
    id: 2,
    title: 'ВИЛЛА HORIZON',
    category: 'Частная резиденция',
    year: '2023',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    description: 'Минималистичная вилла с панорамным остеклением. Гармония архитектуры и природного ландшафта.'
  },
  {
    id: 3,
    title: 'КУЛЬТУРНЫЙ ЦЕНТР',
    category: 'Общественное здание',
    year: '2023',
    image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=80',
    description: 'Пространство для выставок и перформансов. Смелые архитектурные формы и игры со светом.'
  },
  {
    id: 4,
    title: 'ЛОФТ КВАРТАЛ',
    category: 'Реновация',
    year: '2022',
    image: 'https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&q=80',
    description: 'Превращение промышленного комплекса в жилой квартал. Сохранение исторической эстетики.'
  },
  {
    id: 5,
    title: 'БИЗНЕС ПАРК',
    category: 'Коммерческая архитектура',
    year: '2022',
    image: 'https://images.unsplash.com/photo-1554435493-93422e8220c8?w=800&q=80',
    description: 'Современный офисный кластер с зелеными террасами и инновационными фасадными решениями.'
  },
  {
    id: 6,
    title: 'ЭКО-ЖИЛОЙ КОМПЛЕКС',
    category: 'Жилая архитектура',
    year: '2021',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    description: 'Экологичный проект с вертикальным озеленением и системами устойчивого энергопотребления.'
  }
]

// Services data
const services = [
  {
    icon: 'building-2',
    title: 'Архитектурное проектирование',
    description: 'Полный цикл разработки от концепции до рабочей документации. Комплексные решения для объектов любой сложности.'
  },
  {
    icon: 'pencil-ruler',
    title: 'Интерьерный дизайн',
    description: 'Создание уникальных пространств внутри зданий. От эскизов до авторского надзора при реализации.'
  },
  {
    icon: 'land-plot',
    title: 'Ландшафтная архитектура',
    description: 'Гармоничное вписывание объектов в окружающую среду. Проектирование парков и общественных пространств.'
  },
  {
    icon: 'clipboard-check',
    title: 'Авторский надзор',
    description: 'Контроль строительства на всех этапах. Гарантия соответствия проекту и высокого качества работ.'
  }
]

// Blog posts data
const blogPosts = [
  {
    id: 1,
    title: 'Минимализм в современной архитектуре',
    excerpt: 'Почему меньше - это больше. Как лаконичные формы создают эмоциональный отклик и функциональность.',
    date: '15 ЯНВ 2024',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80'
  },
  {
    id: 2,
    title: 'Будущее устойчивой архитектуры',
    excerpt: 'Экологические тренды и технологии, которые формируют города завтрашнего дня.',
    date: '08 ЯНВ 2024',
    image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=600&q=80'
  },
  {
    id: 3,
    title: 'Свет как архитектурный материал',
    excerpt: 'Игра света и тени в проектировании. Как освещение трансформирует пространство.',
    date: '28 ДЕК 2023',
    image: 'https://images.unsplash.com/photo-1504198266287-1659872e6590?w=600&q=80'
  }
]

function App() {
  const [activeProject, setActiveProject] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState('Все')

  const filters = ['Все', 'Коммерческая', 'Жилая', 'Общественная']

  const filteredProjects = activeFilter === 'Все'
    ? portfolioProjects
    : portfolioProjects.filter(p => p.category.toLowerCase().includes(activeFilter.toLowerCase()))

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setMobileMenuOpen(false)
    }
  }

  // Contact Form Component
  const ContactForm = () => {
    const { isSubmitting, isSuccess, isError, errorMessage, handleSubmit, resetForm } = useFormHandler()
    const ACCESS_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY'

    return (
      <div className="relative">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={(e) => handleSubmit(e, ACCESS_KEY)}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <input
                  type="text"
                  name="name"
                  placeholder="Ваше имя"
                  required
                  className="w-full px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-none text-white placeholder-zinc-500 focus:outline-none focus:border-accent transition-colors font-montserrat"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  className="w-full px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-none text-white placeholder-zinc-500 focus:outline-none focus:border-accent transition-colors font-montserrat"
                />
              </div>
              <input
                type="text"
                name="subject"
                placeholder="Тема обращения"
                className="w-full px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-none text-white placeholder-zinc-500 focus:outline-none focus:border-accent transition-colors font-montserrat"
              />
              <textarea
                name="message"
                placeholder="Расскажите о вашем проекте..."
                rows="5"
                required
                className="w-full px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-none text-white placeholder-zinc-500 focus:outline-none focus:border-accent transition-colors resize-none font-montserrat"
              ></textarea>

              {isError && (
                <div className="text-red-500 text-sm font-montserrat">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accent hover:bg-accent/90 disabled:bg-zinc-600 disabled:cursor-not-allowed text-black px-8 py-5 font-bold font-bebas text-xl tracking-wider transition-all transform hover:scale-[1.02] disabled:transform-none flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    Отправка...
                  </>
                ) : (
                  <>
                    <SafeIcon name="send" size={20} className="text-black" />
                    ОТПРАВИТЬ СООБЩЕНИЕ
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, type: "spring" }}
              className="text-center py-16"
            >
              <div className="bg-accent/20 w-24 h-24 flex items-center justify-center mx-auto mb-8">
                <SafeIcon name="check-circle" size={48} className="text-accent" />
              </div>
              <h3 className="text-4xl font-bebas text-white mb-4 tracking-wide">
                СООБЩЕНИЕ ОТПРАВЛЕНО!
              </h3>
              <p className="text-zinc-400 mb-8 max-w-md mx-auto font-montserrat">
                Спасибо за обращение. Мы свяжемся с вами в ближайшее время.
              </p>
              <button
                onClick={resetForm}
                className="text-accent hover:text-accent/80 font-semibold font-montserrat transition-colors"
              >
                Отправить еще сообщение
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black font-montserrat overflow-x-hidden">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-zinc-900">
        <nav className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent flex items-center justify-center">
              <span className="font-bebas text-black text-xl font-bold">FA</span>
            </div>
            <span className="font-bebas text-2xl text-white tracking-wider">FORM ARCHITECTS</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {['портфолио', 'услуги', 'блог', 'контакты'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className="font-bebas text-lg tracking-wider text-zinc-400 hover:text-accent transition-colors relative group"
              >
                {item.toUpperCase()}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
              </button>
            ))}
          </div>

          <button
            onClick={() => scrollToSection('контакты')}
            className="hidden md:flex items-center gap-2 bg-accent text-black px-6 py-3 font-bebas text-lg tracking-wider hover:bg-accent/90 transition-all"
          >
            НАЧАТЬ ПРОЕКТ
            <SafeIcon name="arrow-right" size={18} />
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white"
          >
            <SafeIcon name={mobileMenuOpen ? 'x' : 'menu'} size={28} />
          </button>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-zinc-950 border-t border-zinc-900"
            >
              <div className="px-4 py-6 space-y-4">
                {['портфолио', 'услуги', 'блог', 'контакты'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item)}
                    className="block w-full text-left font-bebas text-2xl tracking-wider text-white hover:text-accent transition-colors py-2"
                  >
                    {item.toUpperCase()}
                  </button>
                ))}
                <button
                  onClick={() => scrollToSection('контакты')}
                  className="w-full bg-accent text-black py-4 font-bebas text-xl tracking-wider mt-4"
                >
                  НАЧАТЬ ПРОЕКТ
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO SECTION */}
      <section className="min-h-screen flex items-center relative pt-20">
        {/* Geometric Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-0 w-[600px] h-[2px] bg-gradient-to-l from-accent/30 to-transparent" />
          <div className="absolute bottom-1/3 left-0 w-[400px] h-[2px] bg-gradient-to-r from-accent/20 to-transparent" />
          <div className="absolute top-1/2 right-1/4 w-[1px] h-[300px] bg-gradient-to-b from-accent/10 to-transparent" />
          <div className="absolute top-20 right-20 w-40 h-40 border border-zinc-800 rotate-45 opacity-30" />
          <div className="absolute bottom-40 left-10 w-20 h-20 border border-accent/20 rotate-12" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-[2px] bg-accent" />
                <span className="font-montserrat text-sm tracking-[0.3em] text-accent uppercase">Архитектурное бюро</span>
              </div>
              <h1 className="font-bebas text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-white leading-[0.9] mb-6 tracking-tight">
                СОЗДАЕМ
                <span className="text-accent block">ПРОСТРАНСТВА</span>
              </h1>
              <p className="font-montserrat text-lg md:text-xl text-zinc-400 max-w-xl mb-10 leading-relaxed">
                Архитектура как искусство форм. Геометрия, свет и материалы —
                создаем уникальные решения для жизни и бизнеса.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => scrollToSection('портфолио')}
                  className="bg-accent text-black px-8 py-4 font-bebas text-xl tracking-wider hover:bg-accent/90 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3"
                >
                  СМОТРЕТЬ ПРОЕКТЫ
                  <SafeIcon name="arrow-right" size={20} />
                </button>
                <button
                  onClick={() => scrollToSection('контакты')}
                  className="border border-zinc-700 text-white px-8 py-4 font-bebas text-xl tracking-wider hover:border-accent hover:text-accent transition-all flex items-center justify-center gap-3"
                >
                  <SafeIcon name="phone" size={18} />
                  СВЯЗАТЬСЯ
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="relative"
            >
              <div className="relative aspect-[4/5] md:aspect-square">
                <img
                  src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80"
                  alt="Modern architecture"
                  className="w-full h-full object-cover grayscale"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute -bottom-4 -right-4 w-32 h-32 border-2 border-accent" />
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-accent/10" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="font-montserrat text-xs tracking-widest text-zinc-500 uppercase">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-accent to-transparent" />
        </motion.div>
      </section>

      {/* PORTFOLIO SECTION */}
      <section id="портфолио" className="py-24 md:py-32 bg-zinc-950">
        <div className="container mx-auto px-4 md:px-6">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-[2px] bg-accent" />
                  <span className="font-montserrat text-sm tracking-[0.3em] text-accent uppercase">Портфолио</span>
                </div>
                <h2 className="font-bebas text-5xl md:text-7xl text-white tracking-tight">
                  НАШИ <span className="text-accent">ПРОЕКТЫ</span>
                </h2>
              </div>

              {/* Filter buttons */}
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 font-montserrat text-sm tracking-wider transition-all ${
                      activeFilter === filter
                        ? 'bg-accent text-black'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {filter.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <ScrollReveal key={project.id} delay={index * 0.1}>
                <motion.div
                  layout
                  className="group relative overflow-hidden cursor-pointer"
                  onClick={() => setActiveProject(project)}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Yellow border on hover */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-accent transition-all duration-500" />

                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-montserrat text-xs tracking-widest text-accent">{project.category}</span>
                      <span className="text-zinc-500">|</span>
                      <span className="font-montserrat text-xs text-zinc-500">{project.year}</span>
                    </div>
                    <h3 className="font-bebas text-3xl text-white group-hover:text-accent transition-colors tracking-wide">
                      {project.title}
                    </h3>
                  </div>

                  <div className="absolute top-4 right-4 w-10 h-10 bg-accent/0 group-hover:bg-accent flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
                    <SafeIcon name="arrow-up-right" size={20} className="text-black" />
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECT MODAL */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
            onClick={() => setActiveProject(null)}
          >
            <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative bg-zinc-950 border border-zinc-800 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveProject(null)}
                className="absolute top-4 right-4 z-10 w-12 h-12 bg-accent flex items-center justify-center hover:bg-accent/90 transition-colors"
              >
                <SafeIcon name="x" size={24} className="text-black" />
              </button>

              <div className="aspect-video relative">
                <img
                  src={activeProject.image}
                  alt={activeProject.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
              </div>

              <div className="p-8 md:p-12">
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span className="font-montserrat text-sm tracking-widest text-accent uppercase">{activeProject.category}</span>
                  <span className="text-zinc-600">|</span>
                  <span className="font-montserrat text-sm text-zinc-500">{activeProject.year}</span>
                </div>
                <h2 className="font-bebas text-4xl md:text-6xl text-white mb-6 tracking-wide">
                  {activeProject.title}
                </h2>
                <p className="font-montserrat text-zinc-400 text-lg leading-relaxed mb-8">
                  {activeProject.description}
                </p>
                <button
                  onClick={() => scrollToSection('контакты')}
                  className="bg-accent text-black px-8 py-4 font-bebas text-xl tracking-wider hover:bg-accent/90 transition-all flex items-center gap-3"
                >
                  ОБСУДИТЬ ПРОЕКТ
                  <SafeIcon name="arrow-right" size={20} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SERVICES SECTION */}
      <section id="услуги" className="py-24 md:py-32 bg-black relative overflow-hidden">
        {/* Background geometric shapes */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] border border-zinc-900/50 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] border border-zinc-900/30 rotate-45 -translate-x-1/2 translate-y-1/2" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16 md:mb-20">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-12 h-[2px] bg-accent" />
                <span className="font-montserrat text-sm tracking-[0.3em] text-accent uppercase">Услуги</span>
                <div className="w-12 h-[2px] bg-accent" />
              </div>
              <h2 className="font-bebas text-5xl md:text-7xl text-white tracking-tight">
                ЧТО МЫ <span className="text-accent">ПРЕДЛАГАЕМ</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {services.map((service, index) => (
              <ScrollReveal key={index} delay={index * 0.15}>
                <div className="group relative bg-zinc-950 border border-zinc-900 p-8 md:p-10 hover:border-accent transition-all duration-500">
                  {/* Geometric corner accent */}
                  <div className="absolute top-0 right-0 w-20 h-20">
                    <div className="absolute top-0 right-0 w-full h-[2px] bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-500" />
                    <div className="absolute top-0 right-0 w-[2px] h-full bg-accent scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-500 delay-100" />
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-zinc-900 flex items-center justify-center group-hover:bg-accent transition-colors duration-500 flex-shrink-0">
                      <SafeIcon
                        name={service.icon}
                        size={32}
                        className="text-accent group-hover:text-black transition-colors duration-500"
                      />
                    </div>
                    <div>
                      <h3 className="font-bebas text-2xl md:text-3xl text-white mb-3 group-hover:text-accent transition-colors tracking-wide">
                        {service.title.toUpperCase()}
                      </h3>
                      <p className="font-montserrat text-zinc-400 leading-relaxed text-sm md:text-base">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* CTA Block */}
          <ScrollReveal delay={0.4}>
            <div className="mt-16 md:mt-20 text-center">
              <div className="inline-block border border-zinc-800 p-8 md:p-12 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black px-4">
                  <span className="font-montserrat text-sm text-zinc-500 uppercase tracking-widest">Следующий шаг</span>
                </div>
                <h3 className="font-bebas text-3xl md:text-5xl text-white mb-6 tracking-wide">
                  ГОТОВЫ НАЧАТЬ ПРОЕКТ?
                </h3>
                <button
                  onClick={() => scrollToSection('контакты')}
                  className="bg-accent text-black px-10 py-4 font-bebas text-xl tracking-wider hover:bg-accent/90 transition-all transform hover:scale-[1.02] inline-flex items-center gap-3"
                >
                  ЗАПРОСИТЬ КОНСУЛЬТАЦИЮ
                  <SafeIcon name="arrow-right" size={20} />
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* BLOG SECTION */}
      <section id="блог" className="py-24 md:py-32 bg-zinc-950">
        <div className="container mx-auto px-4 md:px-6">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-[2px] bg-accent" />
                  <span className="font-montserrat text-sm tracking-[0.3em] text-accent uppercase">Блог</span>
                </div>
                <h2 className="font-bebas text-5xl md:text-7xl text-white tracking-tight">
                  ИДЕИ И <span className="text-accent">ТРЕНДЫ</span>
                </h2>
              </div>
              <button className="font-montserrat text-sm tracking-widest text-zinc-400 hover:text-accent transition-colors flex items-center gap-2 uppercase">
                Все статьи
                <SafeIcon name="arrow-right" size={16} />
              </button>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {blogPosts.map((post, index) => (
              <ScrollReveal key={post.id} delay={index * 0.1}>
                <article className="group cursor-pointer">
                  <div className="relative overflow-hidden mb-6">
                    <div className="aspect-[4/3]">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                      />
                    </div>
                    {/* Geometric divider */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-accent/50 to-transparent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-montserrat text-xs text-accent tracking-widest">{post.date}</span>
                    <div className="w-8 h-[1px] bg-zinc-700" />
                  </div>
                  <h3 className="font-bebas text-2xl text-white mb-3 group-hover:text-accent transition-colors tracking-wide">
                    {post.title.toUpperCase()}
                  </h3>
                  <p className="font-montserrat text-zinc-400 text-sm leading-relaxed">
                    {post.excerpt}
                  </p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="контакты" className="py-24 md:py-32 bg-black relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-16">
            {/* Contact Info */}
            <div>
              <ScrollReveal>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-[2px] bg-accent" />
                  <span className="font-montserrat text-sm tracking-[0.3em] text-accent uppercase">Контакты</span>
                </div>
                <h2 className="font-bebas text-5xl md:text-7xl text-white mb-6 tracking-tight">
                  ДАВАЙТЕ <span className="text-accent">ОБСУДИМ</span>
                </h2>
                <p className="font-montserrat text-zinc-400 text-lg leading-relaxed mb-10 max-w-lg">
                  Расскажите о вашем проекте. Мы свяжемся с вами для обсуждения
                  деталей и подготовки индивидуального предложения.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <div className="space-y-6 mb-10">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-zinc-900 flex items-center justify-center flex-shrink-0">
                      <SafeIcon name="map-pin" size={20} className="text-accent" />
                    </div>
                    <div>
                      <h4 className="font-bebas text-xl text-white mb-1 tracking-wide">АДРЕС</h4>
                      <p className="font-montserrat text-zinc-400 text-sm">г. Москва, Большой Козихинский пер., 12</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-zinc-900 flex items-center justify-center flex-shrink-0">
                      <SafeIcon name="phone" size={20} className="text-accent" />
                    </div>
                    <div>
                      <h4 className="font-bebas text-xl text-white mb-1 tracking-wide">ТЕЛЕФОН</h4>
                      <p className="font-montserrat text-zinc-400 text-sm">+7 (495) 123-45-67</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-zinc-900 flex items-center justify-center flex-shrink-0">
                      <SafeIcon name="mail" size={20} className="text-accent" />
                    </div>
                    <div>
                      <h4 className="font-bebas text-xl text-white mb-1 tracking-wide">EMAIL</h4>
                      <p className="font-montserrat text-zinc-400 text-sm">info@formarchitects.ru</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Map */}
              <ScrollReveal delay={0.3}>
                <div className="h-[300px] md:h-[350px]">
                  <CleanMap
                    coordinates={[37.5931, 55.7586]}
                    zoom={15}
                    markers={[{ lng: 37.5931, lat: 55.7586, title: 'FORM Architects' }]}
                  />
                </div>
              </ScrollReveal>
            </div>

            {/* Contact Form */}
            <ScrollReveal delay={0.2} direction="right">
              <div className="bg-zinc-950 p-8 md:p-10 border border-zinc-900">
                <h3 className="font-bebas text-3xl text-white mb-8 tracking-wide">
                  НАПИШИТЕ НАМ
                </h3>
                <ContactForm />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-12 md:py-16 telegram-safe-bottom">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-accent flex items-center justify-center">
                  <span className="font-bebas text-black text-xl font-bold">FA</span>
                </div>
                <span className="font-bebas text-2xl text-white tracking-wider">FORM ARCHITECTS</span>
              </div>
              <p className="font-montserrat text-zinc-400 text-sm leading-relaxed max-w-md mb-6">
                Создаем архитектуру, которая вдохновляет. Геометрия, функциональность
                и эстетика в каждом проекте.
              </p>
              <div className="flex gap-4">
                {['instagram', 'facebook', 'linkedin', 'youtube'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 bg-zinc-900 flex items-center justify-center hover:bg-accent transition-colors group"
                  >
                    <SafeIcon name={social} size={18} className="text-zinc-400 group-hover:text-black" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bebas text-xl text-white mb-6 tracking-wide">НАВИГАЦИЯ</h4>
              <ul className="space-y-3">
                {['портфолио', 'услуги', 'блог', 'контакты'].map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => scrollToSection(item)}
                      className="font-montserrat text-sm text-zinc-400 hover:text-accent transition-colors uppercase tracking-wider"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bebas text-xl text-white mb-6 tracking-wide">КОНТАКТЫ</h4>
              <ul className="space-y-3 font-montserrat text-sm text-zinc-400">
                <li>г. Москва</li>
                <li>+7 (495) 123-45-67</li>
                <li>info@formarchitects.ru</li>
                <li className="pt-2">Пн-Пт: 9:00 - 19:00</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-montserrat text-xs text-zinc-500">
              © 2024 FORM Architects. Все права защищены.
            </p>
            <div className="flex gap-6">
              <a href="#" className="font-montserrat text-xs text-zinc-500 hover:text-accent transition-colors">Политика конфиденциальности</a>
              <a href="#" className="font-montserrat text-xs text-zinc-500 hover:text-accent transition-colors">Условия использования</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App