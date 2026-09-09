import type { Language } from './LanguageContext'

export const translations = {
    tr: {
        common: {
            cancel: 'Vazgeç',
            save: 'Kaydet',
            create: 'Oluştur',
            update: 'Güncelle',
            delete: 'Sil',
            edit: 'Düzenle',
            filter: 'Filtre',
            search: 'Ara',
            clear: 'Temizle',
            apply: 'Uygula',
            close: 'Kapat',
            yes: 'Evet',
            no: 'Hayır',
            loading: 'Yükleniyor...',
            actions: 'İşlemler',
            active: 'Aktif',
            inactive: 'Pasif',
        },

        header: {
            changeTheme: 'Tema değiştir',
            changeLanguage: 'Dil değiştir',
            userMenu: 'Kullanıcı menüsü',
            logout: 'Çıkış Yap',
        },

        sidebar: {
            dashboard: 'Kontrol Paneli',
            users: 'Kullanıcı Yönetimi',
            criteria: 'Kriter Yönetimi',
            evaluationPeriods:
                'Değerlendirme Dönemleri',
            evaluatorEmployees:
                'Ekip Atamaları',
            evaluations: 'Değerlendirmeler',
            newEvaluation: 'Yeni Değerlendirme',
            myEvaluations: 'Değerlendirmelerim',
            teamRanking: 'Takım Sıralaması',
            departmentRanking: 'Departman Sıralaması',
        },

        dashboard: {
            welcome: 'Hoş geldin',
            description:
                'Performans değerlendirme sistemine genel bakış.',
            evaluationPeriod: 'Değerlendirme dönemi',
            defaultPeriod: 'Değerlendirme Dönemi',
            periodData:
                'Seçilen döneme ait performans verileri',
            performanceRanking: 'Performans Sıralaması',
            rankingDescription:
                'Çalışanların seçilen dönemdeki performans sonuçları.',
            noData:
                'Bu dönem için performans verisi bulunmuyor.',
            rank: 'SIRA',
            employee: 'ÇALIŞAN',
            department: 'DEPARTMAN',
            evaluation: 'DEĞERLENDİRME',
            average: 'ORTALAMA',
        },

        users: {
            title: 'Kullanıcı Yönetimi',
            description:
                'Sistemdeki tüm kullanıcıları görüntüle, ekle ve yönet.',
            newUser: 'Yeni Kullanıcı',

            firstName: 'Ad',
            lastName: 'Soyad',
            fullName: 'Ad Soyad',
            email: 'E-posta',
            password: 'Şifre',
            role: 'Rol',
            department: 'Departman',
            position: 'Pozisyon',
            jobPosition: 'İş Pozisyonu',
            active: 'Aktif',

            filterUsers: 'Kullanıcıları Filtrele',
            field: 'Alan',
            filterValue: 'Filtre değeri',

            createSuccess:
                'Kullanıcı oluşturuldu.',
            updateSuccess:
                'Kullanıcı güncellendi.',
            deleteSuccess:
                'Kullanıcı silindi.',

            loadError:
                'Veriler yüklenirken hata oluştu.',
            operationError:
                'İşlem sırasında hata oluştu.',
            deleteError:
                'Kullanıcı silinemedi.',
            statusError:
                'Durum güncellenemedi.',

            deleteTitle: 'Kullanıcıyı Sil',

            deleteDescription:
                'Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
        },

        roles: {
            Admin: 'Yönetici',
            Evaluator: 'Değerlendirici',
            Employee: 'Çalışan',
        },

        userForm: {
            createTitle: 'Yeni Kullanıcı',
            editTitle: 'Kullanıcı Düzenle',

            firstName: 'Ad',
            lastName: 'Soyad',
            email: 'E-posta',
            password: 'Şifre',
            role: 'Rol',
            department: 'Departman',
            position:
                'İş Pozisyonu (opsiyonel)',
            activeUser: 'Aktif kullanıcı',

            selectDepartment:
                'Departman seçin',
            selectPosition:
                'İş pozisyonu seçin',
            notSelected: 'Seçilmedi',

            create: 'Oluştur',
            update: 'Güncelle',
            cancel: 'Vazgeç',

            firstNameMin:
                'Ad en az 2 karakter olmalı',
            lastNameMin:
                'Soyad en az 2 karakter olmalı',
            validEmail:
                'Geçerli bir e-posta girin',
            passwordMin:
                'Şifre en az 6 karakter olmalı',
            selectRole:
                'Rol seçin',
            selectDepartmentError:
                'Departman seçin',
        },

        confirmDialog: {
            cancel: 'Vazgeç',
            confirm: 'Onayla',
        },

        messages: {
            unauthorized: 'Yetkiniz yok',
            sessionExpired:
                'Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.',
        },

        footer: {
            allRightsReserved:
                'Tüm hakları saklıdır',
        },
    },

    en: {
        common: {
            cancel: 'Cancel',
            save: 'Save',
            create: 'Create',
            update: 'Update',
            delete: 'Delete',
            edit: 'Edit',
            filter: 'Filter',
            search: 'Search',
            clear: 'Clear',
            apply: 'Apply',
            close: 'Close',
            yes: 'Yes',
            no: 'No',
            loading: 'Loading...',
            actions: 'Actions',
            active: 'Active',
            inactive: 'Inactive',
        },

        header: {
            changeTheme: 'Change theme',
            changeLanguage: 'Change language',
            userMenu: 'User menu',
            logout: 'Log out',
        },

        sidebar: {
            dashboard: 'Dashboard',
            users: 'Users',
            criteria: 'Criteria',
            evaluationPeriods:
                'Evaluation Periods',
            evaluatorEmployees:
                'Evaluator - Employees',
            evaluations: 'Evaluations',
            newEvaluation: 'New Evaluation',
            myEvaluations: 'My Evaluations',
            teamRanking: 'Team Ranking',
            departmentRanking: 'Department Ranking',
        },

        dashboard: {
            welcome: 'Welcome',
            description:
                'Overview of the performance evaluation system.',
            evaluationPeriod: 'Evaluation period',
            defaultPeriod: 'Evaluation Period',
            periodData:
                'Performance data for the selected period',
            performanceRanking: 'Performance Ranking',
            rankingDescription:
                'Performance results of employees for the selected period.',
            noData:
                'No performance data available for this period.',
            rank: 'RANK',
            employee: 'EMPLOYEE',
            department: 'DEPARTMENT',
            evaluation: 'EVALUATION',
            average: 'AVERAGE',
        },

        users: {
            title: 'User Management',
            description:
                'View, add and manage all users in the system.',
            newUser: 'New User',

            firstName: 'First Name',
            lastName: 'Last Name',
            fullName: 'Full Name',
            email: 'Email',
            password: 'Password',
            role: 'Role',
            department: 'Department',
            position: 'Position',
            jobPosition: 'Job Position',
            active: 'Active',

            filterUsers: 'Filter Users',
            field: 'Field',
            filterValue: 'Filter value',

            createSuccess:
                'User created successfully.',
            updateSuccess:
                'User updated successfully.',
            deleteSuccess:
                'User deleted successfully.',

            loadError:
                'An error occurred while loading data.',
            operationError:
                'An error occurred during the operation.',
            deleteError:
                'User could not be deleted.',
            statusError:
                'Status could not be updated.',

            deleteTitle: 'Delete User',

            deleteDescription:
                'Are you sure you want to delete this user? This action cannot be undone.',
        },

        roles: {
            Admin: 'Admin',
            Evaluator: 'Evaluator',
            Employee: 'Employee',
        },

        userForm: {
            createTitle: 'New User',
            editTitle: 'Edit User',

            firstName: 'First Name',
            lastName: 'Last Name',
            email: 'Email',
            password: 'Password',
            role: 'Role',
            department: 'Department',
            position:
                'Job Position (optional)',
            activeUser: 'Active user',

            selectDepartment:
                'Select department',
            selectPosition:
                'Select job position',
            notSelected: 'Not selected',

            create: 'Create',
            update: 'Update',
            cancel: 'Cancel',

            firstNameMin:
                'First name must be at least 2 characters',
            lastNameMin:
                'Last name must be at least 2 characters',
            validEmail:
                'Enter a valid email address',
            passwordMin:
                'Password must be at least 6 characters',
            selectRole:
                'Select a role',
            selectDepartmentError:
                'Select a department',
        },

        confirmDialog: {
            cancel: 'Cancel',
            confirm: 'Confirm',
        },

        messages: {
            unauthorized:
                'You are not authorized',
            sessionExpired:
                'Your session has expired. Please log in again.',
        },

        footer: {
            allRightsReserved:
                'All rights reserved',
        },
    },
} satisfies Record<Language, unknown>