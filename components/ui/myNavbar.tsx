import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu
} from '@/components/ui/resizable-navbar'
import { useState } from 'react'
import Avatar from './Avatar'
import { useNavigate } from 'react-router-dom'

export default function MyNavbar () {
  const navigate = useNavigate()
  const navItems = [
    {
      name: 'Home',
      link: '#features'
    },
    {
      name: 'Transactions',
      link: '#pricing'
    },
    {
      name: 'Friends',
      link: '#contact'
    }
  ]

  function logoutHandler () {
    console.log('logout')
    localStorage.removeItem('token')
    navigate('/')
  }

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <Navbar>
      {/* Desktop Navigation */}
      <NavBody className='border-2 border-neutral-700'>
        <NavbarLogo />
        <NavItems items={navItems} />
        <div className='flex items-center gap-4'>
          <Avatar firstName='Nitin' lastName='sharma' />
          <NavbarButton variant='primary' onClick={logoutHandler}>
            Logout
          </NavbarButton>
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {navItems.map((item, idx) => (
            <a
              key={`mobile-link-${idx}`}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className='relative text-neutral-300'
            >
              <span className='block'>{item.name}</span>
            </a>
          ))}
          <div className='flex w-full flex-col gap-4'>
            <NavbarButton
              onClick={() => setIsMobileMenuOpen(false)}
              variant='primary'
              className='w-full text-white'
            >
              Login
            </NavbarButton>
            <NavbarButton
              onClick={() => setIsMobileMenuOpen(false)}
              variant='primary'
              className='w-full'
            >
              Logout
            </NavbarButton>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  )
}
