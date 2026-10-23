import { Calendar, CheckSquare, DollarSign, Users, Store, MessageSquare, LayoutDashboard, Plus, Settings } from 'lucide-react'

export const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/budget', label: 'Budget', icon: DollarSign },
  { href: '/guests', label: 'Guests', icon: Users },
  { href: '/vendors', label: 'Vendors', icon: Store },
  { href: '/assistant', label: 'Assistant', icon: MessageSquare },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export const quickAction = { href: '/events/new', label: 'Create event', icon: Plus }
