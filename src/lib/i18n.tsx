'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

const translations = {
	en: {
		app: {
			title: 'My Restock',
			subtitle: 'Track your recurring purchases',
			signIn: 'Sign In',
			register: 'Register',
			signOut: 'Sign Out',
			logout: 'Log Out',
			totalSpent: 'Total Spent',
			itemsCount: 'Items',
			yourItems: 'Your Items',
			continue: 'Continue',
			authenticating: 'Authenticating...',
			creatingAccount: 'Creating account...',
			latest: 'Latest',
			days: 'days',
			addFirst: 'Add your first item!',
			loading: 'Loading...',
			processing: 'Processing...',
			successReg: 'Registration successful! You can now log in.',
			errorReg: 'Registration failed',
			errorLogin: 'Login failed',
			username: 'Username',
			welcome: 'Track what you buy, when you buy it.',
			getStarted: 'Get Started',
			features: 'Features',
			feature1: 'Track History',
			feature1Desc: 'Keep a log of everything you buy regularly.',
			feature2: 'Analyze Spending',
			feature2Desc: 'See where your money goes every month.',
			feature3: 'Smart Alerts',
			feature3Desc: 'Know exactly when to restock.',
			dashboard: 'Dashboard',
			trends: 'Trends',
			navHistory: 'History',
			navAdd: 'Add',
			navTrends: 'Trends',
			date: 'Date',
			itemName: 'Item Name',
			price: 'Price',
			note: 'Note',
			save: 'Save',
			buyDate: 'Buy Date',
			avgDays: 'Avg Days',
			gaps: 'Intervals',
			delete: 'Delete',
			usedFor: 'Used for',
			dayUnit: 'days',
			recordBuy: 'Record Purchase',
			whatBuy: 'What did you buy today?',
			landingPage: 'Home Page',
			goToDashboard: 'Go to Dashboard',
			loginTitle: 'Restock Auth',
			loginSubtitle: 'Secure passwordless entry',
			signupSubtitle: 'Create your account',
			login: 'Log In',
			signup: 'Sign Up',
			placeholderItem: 'e.g. Shampoo, Coffee, Rice',
			placeholderNote: 'Brand, Size, Shop...',
			loggingOut: 'Logging out...',
			currency: '฿',
			domain: 'restock.app',
			installApp: 'Install App',
			installDesc: 'Experience Restock as a native app on your device.',
			installIOS: 'iOS',
			installIOSStep: "Tap 'Share' and 'Add to Home Screen'",
			installAndroid: 'Android',
			installAndroidStep: "Tap 'More' (⋮) and 'Install App'",
			installDesktop: 'Desktop',
			installDesktopStep: "Click 'Install' icon in address bar"
		},
		trends: {
			title: 'Spending Trends',
			totalSpending: 'Total Spending',
			topItems: 'Top Items by Cost',
			cost: 'Cost'
		},
		settings: {
			title: 'Settings',
			appearance: 'Appearance',
			account: 'Account',
			theme: 'Theme',
			darkMode: 'Dark Mode',
			lightMode: 'Light Mode',
			language: 'Language',
			langEn: 'English',
			langTh: 'Thai',
			deleteAccount: 'Delete Account',
			confirmDeleteTitle: 'Delete Account?',
			confirmDeleteDesc: 'This action cannot be undone. All your data will be permanently lost.',
			typeToDelete: 'Type "DELETE" to confirm.',
			deletePlaceholder: 'DELETE',
			cancel: 'Cancel',
			confirm: 'Delete',
			requestFeature: 'Request Feature',
			feedbackTitle: 'Request a Feature',
			feedbackDesc: 'Help us improve Restock! Share your ideas or report issues.',
			feedbackPlaceholder: 'I wish I could...',
			submit: 'Submit',
			successFeedback: 'Thank you for your feedback!',
			editEntry: 'Edit Entry',
			saveChanges: 'Save Changes',
			deleting: 'Deleting...',
			errorDelete: 'Failed to delete account',
			errorFeedback: 'Failed to submit feedback'
		}
	},
	th: {
		app: {
			title: 'Restock ของฉัน',
			subtitle: 'ติดตามการซื้อซ้ำ',
			signIn: 'เข้าสู่ระบบ',
			register: 'ลงทะเบียน',
			signOut: 'ออกจากระบบ',
			logout: 'ออกจากระบบ',
			totalSpent: 'ยอดใช้จ่ายรวม',
			itemsCount: 'รายการสินค้า',
			yourItems: 'รายการสินค้าของคุณ',
			continue: 'ไปต่อ',
			authenticating: 'กำลังยืนยันตัวตน...',
			creatingAccount: 'กำลังสร้างบัญชี...',
			latest: 'ล่าสุด',
			days: 'วัน',
			addFirst: 'บันทึกรายการแรกเลย!',
			loading: 'กำลังโหลด...',
			processing: 'กำลังดำเนินการ...',
			successReg: 'ลงทะเบียนสำเร็จ! เข้าสู่ระบบได้เลย',
			errorReg: 'ลงทะเบียนล้มเหลว',
			errorLogin: 'เข้าสู่ระบบล้มเหลว',
			username: 'ชื่อผู้ใช้',
			welcome: 'บันทึกสิ่งที่คุณซื้อ รู้ทันทุกการจับจ่าย',
			getStarted: 'เริ่มต้นใช้งาน',
			features: 'ฟีเจอร์เด่น',
			feature1: 'ประวัติการซื้อ',
			feature1Desc: 'เก็บทุกรายการที่คุณซื้อบ่อยๆ ไว้ในที่เดียว',
			feature2: 'วิเคราะห์ค่าใช้จ่าย',
			feature2Desc: 'ดูภาพรวมการใช้เงินของคุณในแต่ละเดือน',
			feature3: 'แจ้งเตือนอัจฉริยะ',
			feature3Desc: 'รู้ทันทีว่าของใกล้หมดเมื่อไหร่',
			dashboard: 'หน้าหลัก',
			trends: 'แนวโน้ม',
			navHistory: 'ประวัติ',
			navAdd: 'เพิ่ม',
			navTrends: 'แนวโน้ม',
			date: 'วันที่',
			itemName: 'ชื่อสินค้า',
			price: 'ราคา',
			note: 'บันทึกเพิ่มเติม',
			save: 'บันทึก',
			buyDate: 'วันที่ซื้อ',
			avgDays: 'ระยะเฉลี่ย',
			gaps: 'รอบการซื้อ',
			delete: 'ลบ',
			usedFor: 'ใช้ไป',
			dayUnit: 'วัน',
			recordBuy: 'บันทึกรายการซื้อ',
			whatBuy: 'วันนี้เติมของอะไรบ้าง?',
			landingPage: 'หน้าหลัก',
			goToDashboard: 'ไปที่แดชบอร์ด',
			loginTitle: 'เข้าสู่ระบบ Restock',
			loginSubtitle: 'ปลอดภัย ไร้รหัสผ่าน',
			signupSubtitle: 'สร้างบัญชีผู้ใช้',
			login: 'เข้าสู่ระบบ',
			signup: 'ลงทะเบียน',
			placeholderItem: 'เช่น แชมพู, กาแฟ, ข้าวสาร',
			placeholderNote: 'ยี่ห้อ, ขนาด, ร้านที่ซื้อ...',
			loggingOut: 'กำลังออกจากระบบ...',
			currency: '฿',
			domain: 'restock.app',
			installApp: 'ติดตั้งแอป',
			installDesc: 'ใช้งาน Restock ได้เหมือนแอปทั่วไปบนอุปกรณ์ของคุณ',
			installIOS: 'iOS',
			installIOSStep: "กดปุ่ม 'แชร์' แล้วเลือก 'เพิ่มไปยังหน้าจอโฮม'",
			installAndroid: 'Android',
			installAndroidStep: "กดปุ่ม 'เพิ่มเติม' (⋮) แล้วเลือก 'ติดตั้งแอป'",
			installDesktop: 'Desktop',
			installDesktopStep: "คลิกไอคอน 'ติดตั้ง' (Install) บนแถบที่อยู่"
		},
		trends: {
			title: 'แนวโน้มการใช้จ่าย',
			totalSpending: 'ยอดรวมรายเดือน',
			topItems: 'สินค้าที่ใช้จ่ายสูงสุด',
			cost: 'ยอดรวม'
		},
		settings: {
			title: 'การตั้งค่า',
			appearance: 'รูปลักษณ์',
			account: 'บัญชี',
			theme: 'ธีม',
			darkMode: 'โหมดมืด',
			lightMode: 'โหมดสว่าง',
			language: 'ภาษา',
			langEn: 'English',
			langTh: 'ไทย',
			deleteAccount: 'ลบบัญชีผู้ใช้',
			confirmDeleteTitle: 'ยืนยันการลบบัญชี?',
			confirmDeleteDesc: 'การดำเนินการนี้ไม่สามารถย้อนกลับได้ ข้อมูลทั้งหมดของคุณจะถูกลบถาวร',
			typeToDelete: 'พิมพ์ "DELETE" เพื่อยืนยัน',
			deletePlaceholder: 'DELETE',
			cancel: 'ยกเลิก',
			confirm: 'ลบ',
			requestFeature: 'ขอฟีเจอร์ใหม่',
			feedbackTitle: 'เสนอแนะฟีเจอร์',
			feedbackDesc: 'ช่วยเราปรับปรุง Restock! แบ่งปันไอเดียหรือแจ้งปัญหา',
			feedbackPlaceholder: 'ฉันอยากให้มี...',
			submit: 'ส่ง',
			successFeedback: 'ขอบคุณสำหรับคำแนะนำ!',
			editEntry: 'แก้ไขรายการ',
			saveChanges: 'บันทึกการเปลี่ยนแปลง',
			deleting: 'กำลังลบ...',
			errorDelete: 'ลบบัญชีไม่สำเร็จ',
			errorFeedback: 'ส่งข้อเสนอแนะไม่สำเร็จ'
		}
	}
};

type Locale = 'en' | 'th';

interface I18nContextType {
	locale: Locale;
	setLocale: (l: Locale) => void;
	t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
	const [locale, setLocale] = useState<Locale>('th');

	const t = (key: string) => {
		const keys = key.split('.');
		let result: unknown = translations[locale];
		for (const k of keys) {
			if (result && typeof result === 'object') {
                result = (result as Record<string, unknown>)[k];
            }
		}
		return (result as string) || key;
	};

	return (
		<I18nContext.Provider value={{ locale, setLocale, t }}>
			{children}
		</I18nContext.Provider>
	);
}

export function useTranslation() {
	const context = useContext(I18nContext);
	if (!context) {
		throw new Error('useTranslation must be used within an I18nProvider');
	}
	return context;
}
