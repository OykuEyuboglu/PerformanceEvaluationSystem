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
        criteria: {
            title: 'Kriter Yönetimi',
            description:
                'Performans kategorilerini, ağırlıklarını ve pozisyon bazlı değerlendirme kriterlerini yönetin.',
            newCategory: 'Yeni Kategori',

            category: 'Kategori',
            activeCriteria: 'Aktif Kriter',
            totalCriteria: 'Toplam Kriter',
            totalCategory: 'Toplam kategori',
            publishedCriteria: 'Yayında olan kriter',
            definedCriteria: 'Tanımlı kriter',

            activeWeight: 'Aktif Ağırlık',
            distributionCompleted: 'Dağılım tamamlandı',
            distributionMustBe100: 'Dağılım %100 olmalı',

            weightDistribution: 'Kategori Ağırlık Dağılımı',
            activeCategoriesTotalWeight:
                'Aktif kategorilerin toplam ağırlığı',
            distributionReady: 'Ağırlık dağılımı hazır.',
            distributionMustBe100ForCalculation:
                'Değerlendirme hesaplaması için toplam %100 olmalı.',

            noCategory:
                'Henüz kategori eklenmemiş.',
            noCategoryDescription:
                'İlk performans kategorisini oluşturarak başlayabilirsiniz.',

            activeCriteriaCount:
                'aktif kriter',
            totalCriteriaCount:
                'toplam kriter',

            editCategory: 'Kategoriyi düzenle',
            deleteCategory: 'Kategoriyi sil',

            categoryCriteriaDescription:
                'Bu kategori altında değerlendirilecek kriterleri yönetin.',
            addCriterion: 'Kriter Ekle',

            noCriteria:
                'Bu kategoride henüz kriter yok.',
            noCriteriaDescription:
                'Yukarıdaki “Kriter Ekle” butonunu kullanabilirsiniz.',

            criteriaDescriptionCount:
                'pozisyon için açıklama tanımlı',

            editCriterion: 'Kriteri düzenle',
            deleteCriterion: 'Kriteri sil',

            inactive: 'Pasif',

            categoryCreated: 'Kategori oluşturuldu.',
            categoryUpdated: 'Kategori güncellendi.',
            categoryDeleted: 'Kategori silindi.',

            criterionCreated: 'Kriter oluşturuldu.',
            criterionUpdated: 'Kriter güncellendi.',
            criterionDeleted: 'Kriter silindi.',

            loadError:
                'Veriler yüklenirken hata oluştu.',
            operationError:
                'İşlem sırasında hata oluştu.',
            categoryDeleteError:
                'Kategori silinemedi. İçinde kriter olabilir.',
            criterionDeleteError:
                'Kriter silinemedi.',

            deleteCategoryTitle: 'Kategoriyi Sil',
            deleteCategoryDescription:
                'Bu kategoriyi silmek istediğinize emin misiniz? İçindeki kriterler etkilenebilir.',

            deleteCriterionTitle: 'Kriteri Sil',
            deleteCriterionDescription:
                'Bu kriteri silmek istediğinize emin misiniz?',
        },

        criteriaForm: {
            createTitle: 'Yeni Kriter',
            editTitle: 'Kriteri Düzenle',
            description:
                'Pozisyonlara göre uygulanacak performans kriterini tanımlayın.',
            criterionName: 'Kriter Adı',
            mainCategory: 'Ana Kategori',
            categoryDescription:
                'Kriter bu kategori altında oluşturulur.',
            criterionStatus: 'Kriter Durumu',
            statusDescription:
                'Kriterin değerlendirmelerde kullanılmasını yönetin.',
            active: 'Aktif',
            inactive: 'Pasif',
            applicationPositions: 'Uygulama Pozisyonları',
            applicationPositionsDescription:
                'Kriterin uygulanacağı pozisyonları seçin ve her pozisyon için değerlendirme açıklaması tanımlayın.',
            positions: 'Pozisyonlar',
            selectPosition: 'Pozisyon seç...',
            descriptionForPosition: 'için açıklama',
            cancel: 'Vazgeç',
            saving: 'Kaydediliyor...',
            create: 'Oluştur',
            save: 'Kaydet',
        },

        categoryForm: {
            createTitle: 'Yeni Kategori',
            editTitle: 'Kategoriyi Düzenle',

            description:
                'Performans değerlendirmesindeki ana kategori ve ağırlığını tanımlayın.',

            categoryName: 'Kategori Adı',
            weight: 'Ağırlık',

            categoryStatus: 'Kategori Durumu',

            statusDescription:
                'Pasif kategoriler yeni değerlendirmelerde kullanılmaz.',

            active: 'Aktif',
            inactive: 'Pasif',

            cancel: 'Vazgeç',
            saving: 'Kaydediliyor...',
            create: 'Oluştur',
            save: 'Kaydet',
        },

        evaluationPeriods: {
            title: 'Değerlendirme Dönemleri',
            description:
                'Performans değerlendirmelerinin yürütüleceği dönemleri oluşturun ve yönetin.',

            newPeriod: 'Yeni Dönem',

            totalPeriods: 'Toplam Dönem',
            active: 'Aktif',
            upcoming: 'Yaklaşan',
            completed: 'Tamamlanan',

            noPeriods:
                'Henüz değerlendirme dönemi tanımlanmamış.',
            noPeriodsDescription:
                'İlk dönemi oluşturarak değerlendirme sürecini başlatabilirsiniz.',

            editPeriod: 'Dönemi düzenle',
            deletePeriod: 'Dönemi sil',

            deleteTitle: 'Dönemi Sil',

            periodCreated: 'Dönem oluşturuldu.',
            periodUpdated: 'Dönem güncellendi.',
            periodDeleted: 'Dönem silindi.',

            loadError:
                'Dönemler yüklenirken hata oluştu.',
            operationError:
                'İşlem sırasında hata oluştu.',
            deleteError:
                'Bu döneme ait değerlendirmeler olduğu için silinemedi.',
        },

        evaluationPeriodForm: {
            createTitle: 'Yeni Değerlendirme Dönemi',
            editTitle: 'Dönemi Düzenle',

            description:
                'Değerlendirme sürecinin adını ve tarih aralığını tanımlayın.',

            periodName: 'Dönem Adı',

            periodNamePlaceholder:
                'Örn. 2026 Yıl Sonu Performans Değerlendirmesi',

            dateRange: 'Tarih Aralığı',

            dateRangeDescription:
                'Değerlendirmelerin yapılabileceği başlangıç ve bitiş tarihlerini belirleyin.',

            startDate: 'Başlangıç Tarihi',
            endDate: 'Bitiş Tarihi',

            cancel: 'Vazgeç',
            saving: 'Kaydediliyor...',
            create: 'Oluştur',
            save: 'Kaydet',
        },

        evaluatorEmployees: {
            title: 'Ekip Atamaları',
            description:
                'Değerlendiricilerin sorumlu olduğu çalışan ekiplerini yönet.',

            evaluators: 'değerlendirici',
            activeEmployees: 'aktif çalışan',

            noEvaluators:
                'Sistemde henüz "Değerlendirici" rolünde kullanıcı yok. Önce Kullanıcı Yönetimi\'nden ekle.',

            evaluatorsTitle: 'Değerlendiriciler',

            evaluatorSearchPlaceholder:
                'İsim, departman veya e-posta ara...',

            noMatchingEvaluators:
                'Aramayla eşleşen değerlendirici yok.',

            evaluator: 'Değerlendirici',
            employee: 'Çalışan',

            department: 'Departman',
            position: 'Pozisyon',
            email: 'E-posta',

            notSpecified: 'Belirtilmemiş',

            departmentNotSpecified:
                'Departman belirtilmemiş',

            positionNotSpecified:
                'Pozisyon belirtilmemiş',

            positionNone: 'Pozisyon yok',

            employees: 'çalışan',

            selectEvaluator:
                'Bir değerlendirici seç.',

            employeeSearchPlaceholder:
                'Çalışan adı, e-posta veya departman ara...',

            anotherEmployeeSearch:
                'Başka çalışan ara...',

            add: 'Ekle',

            noTeamMembers:
                'Henüz ekip üyesi yok',

            noTeamMembersDescription:
                'Yukarıdaki alandan çalışan seçerek bu ekibe atama yapabilirsin.',

            inactive: 'Pasif',

            removeTitle: 'Ekipten Çıkar',
            remove: 'Çıkar',

            usersLoadError:
                'Kullanıcılar yüklenemedi.',

            teamLoadError:
                'Ekip bilgisi yüklenemedi.',

            employeesAdded:
                '{count} çalışan ekibe eklendi.',

            assignError:
                'Çalışanlar eklenirken hata oluştu.',

            employeeRemoved:
                'Çalışan ekipten çıkarıldı.',

            removeError:
                'Çıkarma sırasında hata oluştu.',
        },

        evaluationDetail: {
            submitted: 'Gönderildi',
            approved: 'Onaylandı',

            evaluator: 'Değerlendiren',
            date: 'Tarih',
            totalScore: 'Toplam Skor',
            comment: 'Yorum',

            close: 'Kapat',
            approve: 'Onayla',
            approving: 'Onaylanıyor...',
        },

        scoreSelector: {
            points: 'puan',

            labels: {
                1: 'Yetersiz',
                2: 'Geliştirilmeli',
                3: 'Beklentiyi Karşılıyor',
                4: 'İyi',
                5: 'Üstün',
            },
        },

        newEvaluation: {
            title: 'Ekibimi Değerlendir',
            description: 'Ekibindeki çalışanları aktif değerlendirme dönemi kapsamında değerlendir.',
            noTeamMembers: 'Ekibinde çalışan bulunmuyor',
            noTeamMembersDescription: 'Henüz sana atanmış bir çalışan bulunmuyor.',
            evaluationPeriod: 'Değerlendirme Dönemi',
            noEmployees: 'Çalışan bulunamadı',
            clear: 'Temizle',
            open: 'Aç',
            close: 'Kapat',
            positionNotSpecified: 'Pozisyon belirtilmemiş',
            employee: 'Çalışan',
            searchEmployee: 'Çalışan ara...',
            completed: 'Tamamlandı',
            evaluation: 'Değerlendirme',
            evaluationProgress: 'Değerlendirme ilerlemesi',
            completedCount: 'tamamlandı',
            checkingStatus: 'Değerlendirme durumları kontrol ediliyor...',
            noActivePeriod: 'Aktif değerlendirme dönemi bulunmuyor',
            noActivePeriodDescription: 'Yeni bir değerlendirme oluşturabilmek için aktif bir dönem bulunması gerekiyor.',
            selectEmployee: 'Çalışan seçerek başlayın',
            selectEmployeeDescription: 'Çalışanın pozisyonuna uygun performans kriterleri burada görüntülenecek.',
            completedEvaluation: 'Değerlendirme tamamlandı',
            completedForEmployee: '{name} için seçilen döneme ait değerlendirme zaten oluşturulmuş.',
            missingPosition: 'Bu çalışanın iş pozisyonu tanımlı değil. Kriterlerin görüntülenebilmesi için kullanıcıya bir iş pozisyonu atanmalıdır.',
            noActiveCriteria: 'Bu pozisyon için tanımlanmış aktif kriter bulunmuyor.',
            commentOptional: 'Yorum (opsiyonel)',
            estimatedScore: 'Tahmini Toplam Skor',
            allCriteriaRequired: 'Göndermeden önce tüm kriterleri puanlamalısın.',
            submitting: 'Kaydediliyor...',
            submit: 'Değerlendirmeyi Gönder',
            alreadyEvaluated: 'Bu çalışan seçilen dönemde zaten değerlendirilmiş.',
            success: 'Değerlendirme başarıyla kaydedildi.',
            saveError: 'Değerlendirme kaydedilirken hata oluştu.',
            loadError: 'Veriler yüklenirken hata oluştu.',
            statusLoadError: 'Değerlendirme durumları alınamadı.',
        },

        myEvaluations: {
            title: 'Performansım',
            description: 'Geçmiş değerlendirmelerin ve puan gelişimin.',
            noEvaluations: 'Henüz bir değerlendirmen bulunmuyor.',
            scoreProgress: 'Puan Gelişimi',
            scoreProgressDescription: 'Değerlendirmelerindeki performans değişimini takip et.',
            totalScore: 'Toplam Skor',
            historyTitle: 'Değerlendirme Geçmişi',
            historyDescription: 'Geçmiş performans sonuçların.',
            searchPlaceholder: 'Dönem veya değerlendirici ara...',
            evaluator: 'Değerlendiren',
            submitted: 'Gönderildi',
            approved: 'Onaylandı',
            noSearchResults: 'Değerlendirme bulunamadı',
            noSearchResultsDescription: 'Arama kriterini değiştirerek tekrar deneyebilirsin.',
            evaluations: 'değerlendirme',
        },

        evaluation: {
            description: 'Sistemdeki performans değerlendirmelerini görüntüle ve incele.',
            employee: 'Çalışan',
            evaluator: 'Değerlendiren',
            period: 'Değerlendirme Dönemi',
            periodShort: 'Dönem',
            totalScore: 'Toplam Skor',
            status: 'Durum',
            date: 'Tarih',
            allPeriods: 'Tüm Dönemler',
            loadDetailError: 'Detay yüklenemedi.',
            approveErrorConsole: 'Değerlendirme onaylanamadı:',
            approvedCountSuffix: 'değerlendirme onaylandı.',
            bulkApproveError: 'Toplu onaylama sırasında hata oluştu.',
            title: 'Değerlendirmeler',
            viewDetails: 'Detayları görüntüle',
            totalEvaluations: 'Toplam Değerlendirme',
            filteredRecords: 'Seçili filtre kapsamındaki kayıtlar',
            averageScore: 'Ortalama Skor',
            overallAverage: 'Değerlendirmelerin genel ortalaması',
            approvalRate: 'onay oranı',
            recordsTitle: 'Değerlendirme Kayıtları',
            recordsListed: 'kayıt listeleniyor',
            searchPlaceholder: 'Çalışan, değerlendirici veya dönem ara...',
            approving: 'Onaylanıyor...',
            approveSelected: 'Seçilenleri Onayla',
            submitted: 'Gönderildi',
            approved: 'Onaylandı',
            gridNoRows: 'Gösterilecek değerlendirme bulunamadı.',
            gridNoResults: 'Sonuç bulunamadı.',
            gridRowSelected: 'satır seçildi',
            gridTotalRows: 'Toplam satır:',
            gridColumnMenu: 'Sütun menüsü',
            gridShowColumns: 'Sütunları göster',
            gridManageColumns: 'Sütunları yönet',
            gridFilter: 'Filtrele',
            gridHideColumn: 'Sütunu gizle',
            gridUnsort: 'Sıralamayı kaldır',
            gridSortAsc: 'Artan sırala',
            gridSortDesc: 'Azalan sırala',
            gridAddFilter: 'Filtre ekle',
            gridDelete: 'Sil',
            gridColumn: 'Sütun',
            gridValue: 'Değer',
            gridFilterValue: 'Filtre değeri',
            gridContains: 'içeriyor',
            gridEquals: 'eşittir',
            gridStartsWith: 'ile başlar',
            gridEndsWith: 'ile biter',
            gridNotEqual: 'eşit değildir',
            gridAfter: 'sonra',
            gridAfterOrEqual: 'sonra veya eşit',
            gridBefore: 'önce',
            gridBeforeOrEqual: 'önce veya eşit',
            gridEmpty: 'boş',
            gridNotEmpty: 'boş değil',
            gridAnyOf: 'şunlardan biri',
            gridSortHint: 'Sıralamak için tıklayın',
            gridSelect: 'Seç',
            gridSelectAll: 'Tüm satırları seç',
            gridUnselectAll: 'Tüm satırların seçimini kaldır',
            gridExport: 'Dışa aktar',
            gridExportCsv: 'CSV olarak dışa aktar',
            gridPrint: 'Yazdır',
            gridColumns: 'Sütunlar',
            gridFilters: 'Filtreler',
            gridDensity: 'Satır yoğunluğu',
            gridCompact: 'Sıkışık',
            gridStandard: 'Standart',
            gridComfortable: 'Rahat',
            gridOperator: 'Operatör',
            gridLogicOperator: 'Mantıksal operatör',
            gridAnd: 'Ve',
            gridOr: 'Veya',
            bulkDialogTitle: 'Değerlendirmeleri Onayla',
            bulkDialogDescription: 'Seçilen {count} değerlendirmeyi onaylamak istediğinize emin misiniz? Bu işlem sonrasında değerlendirmelerin durumu Onaylandı olarak değiştirilecektir.',
            cancel: 'Vazgeç',
            approve: 'Onayla',
        },

        teamRanking: {
            dashboard: 'Dashboard',
            title: 'Ekip Sıralaması',
            description: 'Seçilen dönemdeki ekip performansını karşılaştır ve sonuçları incele.',
            evaluationPeriod: 'Değerlendirme Dönemi',
            active: 'Aktif',
            preparing: 'Hazırlanıyor...',
            excel: 'Excel',
            evaluated: 'DEĞERLENDİRİLEN',
            employee: 'çalışan',
            teamAverage: 'EKİP ORTALAMASI',
            period: 'DÖNEM',
            topThree: 'İlk 3',
            topThreeDescription: 'Seçilen dönemin en yüksek skorları.',
            positionNotSpecified: 'Pozisyon belirtilmemiş',
            performanceRanking: 'Performans Sıralaması',
            detailedResults: 'Detaylı sonuç tablosu.',
            searchPlaceholder: 'Çalışan veya pozisyon ara...',
            noResults: 'Sonuç bulunamadı.',
            noResultsDescription: 'Seçilen dönem veya arama kriteri için gösterilecek kayıt yok.',
            rank: 'Sıra',
            position: 'Pozisyon',
            average: 'Ortalama',
            evaluation: 'Değerlendirme',
        },

        evaluatorDashboard: {
            welcome: 'Hoş geldin',
            evaluator: 'Değerlendirici',
            description: 'Ekibinin performansını tek ekrandan analiz et ve değerlendirme sürecini yönet.',
            evaluationPeriod: 'Değerlendirme Dönemi',
            active: 'Aktif',
            notStarted: 'Başlamadı',
            completed: 'Tamamlandı',
            noPeriods: 'Henüz değerlendirme dönemi bulunmuyor.',
            noPeriodsDescription: 'Bir dönem oluşturulduğunda ekip analizleri burada görünecek.',
            progress: 'Değerlendirme İlerlemesi',
            completedSuffix: 'tamamlandı',
            teamAverage: 'Ekip Ortalaması',
            evaluatedEmployees: 'Değerlendirilen çalışanlar',
            pending: 'Bekleyen',
            pendingEmployees: 'Değerlendirme bekleyen çalışan',
            performanceRange: 'Performans Aralığı',
            gap: 'Fark',
            points: 'puan',
            insufficientData: 'Yeterli veri yok',
            performanceAnalysis: 'Performans Analizi',
            performanceAnalysisDescription: 'Seçilen dönemdeki çalışan skorlarının dağılımı.',
            results: 'sonuç',
            people: 'kişi',
            teamScore: 'EKİP SKORU',
            processHealth: 'Süreç Sağlığı',
            processHealthDescription: 'Değerlendirme sürecinin genel görünümü.',
            completedUpper: 'TAMAMLANDI',
            status: 'DURUM',
            pendingUpper: 'BEKLEYEN',
            topPerformances: 'En Yüksek Performanslar',
            topPerformancesDescription: 'Ekibin öne çıkan çalışanları.',
            viewAll: 'Tümünü Gör',
            noResults: 'Bu dönem için henüz sonuç bulunmuyor.',
            analystSummary: 'Analist Özeti',
            analystSummaryDescription: 'Bu dönem için dikkat çeken göstergeler.',
            rankingView: 'Sıralama görünümü',
            trendUp: 'Üst sıralardaki skorlar güçlü görünüyor.',
            trendDown: 'Skorlar arasında belirgin bir düşüş aralığı var.',
            trendStable: 'Skorlar birbirine yakın seyrediyor.',
            teamSize: 'Ekip büyüklüğü',
            assignedEmployees: 'atanmış çalışan bulunuyor.',
            priority: 'Öncelik',
            waitingSuffix: 'değerlendirme tamamlanmayı bekliyor.',
            allCompleted: 'Tüm değerlendirmeler tamamlandı.',
            evaluate: 'Değerlendirme Yap',
            periodInfo: 'Dönem Bilgisi',
        },

        employeeDashboard: {
            welcome: 'Hoş geldin',
            employee: 'Çalışan',
            description: 'Performansını incele, gelişimini takip et.',
            myEvaluations: 'Değerlendirmelerim',
            noEvaluations: 'Henüz değerlendirme bulunmuyor',
            noEvaluationsDescription: 'Performans değerlendirmen tamamlandığında sonuçların ve performans geçmişin burada görüntülenecek.',
            latestResult: 'SON PERFORMANS SONUCUN',
            excellent: 'Mükemmel Performans',
            veryGood: 'Çok İyi Performans',
            good: 'İyi Performans',
            developing: 'Gelişime Açık',
            needsDevelopment: 'Gelişim Gerekiyor',
            excellentDescription: 'Performansın hedeflerin üzerinde. Başarılı çalışmalarını sürdürmeye devam et.',
            veryGoodDescription: 'Performansın oldukça güçlü. Başarılı sonuçlarını korumaya devam et.',
            goodDescription: 'Performansın iyi seviyede. Gelişim alanlarına odaklanarak daha ileriye taşıyabilirsin.',
            developingDescription: 'Performansını geliştirmek için belirlenen gelişim alanlarına odaklanabilirsin.',
            needsDevelopmentDescription: 'Performansını geliştirmek için gelişim alanlarına odaklanman faydalı olacaktır.',
            performanceScore: 'PERFORMANS SKORU',
            evaluationPeriodUpper: 'DEĞERLENDİRME DÖNEMİ',
            status: 'Durum',
            evaluationCompleted: 'Değerlendirme tamamlandı',
            overallAverage: 'GENEL ORTALAMA',
            evaluation: 'DEĞERLENDİRME',
            result: 'SONUÇ',
            performanceTrend: 'Performans Trendi',
            performanceTrendDescription: 'Son değerlendirmelerindeki performans değişimi.',
            stable: 'Stabil',
            risingTrend: 'Yükselen trend',
            fallingTrend: 'Düşen trend',
            firstEvaluation: 'İlk performans değerlendirmen',
            trendFooter: '{count} değerlendirme üzerinden performans değişimi',
            results: 'Sonuçların',
            recentEvaluations: 'Son değerlendirmelerin',
            viewAllHistory: 'Tüm Geçmişimi Gör',
        },

        adminDashboard: {
            administration: 'Yönetim Paneli',
            heroDescription: 'Performans değerlendirme süreçlerini ve kurum genelindeki sonuçları tek bir ekrandan takip edin.',
            evaluationPeriod: 'Değerlendirme Dönemi',
            exporting: 'Aktarılıyor...',
            exportExcel: "Excel'e Aktar",
            evaluatedEmployees: 'Değerlendirilen Çalışan',
            inSelectedPeriod: 'Seçili dönemde',
            totalEvaluations: 'Toplam Değerlendirme',
            completedEvaluations: 'Tamamlanan değerlendirmeler',
            overallAverage: 'Genel Ortalama',
            overallPerformanceAverage: 'Kurum performans ortalaması',
            highestPerformance: 'En Yüksek Performans',
            excellent: 'Mükemmel',
            veryGood: 'Çok İyi',
            good: 'İyi',
            needsImprovement: 'Geliştirilmeli',
            critical: 'Kritik',
            performanceOverview: 'Performans Özeti',
            performanceOverviewDescription: 'Seçili dönemin en yüksek performans gösteren çalışanları.',
            viewAll: 'Tümünü Gör',
            noEvaluationData: 'Henüz değerlendirme verisi yok',
            noEvaluationDataDescription: 'Seçili dönem için sonuçlar oluştuğunda burada görünecek.',
            evaluations: 'değerlendirme',
            periodSummary: 'Dönem Özeti',
            periodSummaryDescription: 'Seçili değerlendirme döneminin genel görünümü.',
            overallPerformance: 'Genel Performans',
            startDate: 'Başlangıç',
            endDate: 'Bitiş',
            employees: 'Çalışan',
            detailedReport: 'Detaylı Performans Raporu',
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

        criteria: {
            title: 'Criteria Management',
            description:
                'Manage performance categories, weights and position-based evaluation criteria.',
            newCategory: 'New Category',

            category: 'Category',
            activeCriteria: 'Active Criteria',
            totalCriteria: 'Total Criteria',
            totalCategory: 'Total categories',
            publishedCriteria: 'Published criteria',
            definedCriteria: 'Defined criteria',

            activeWeight: 'Active Weight',
            distributionCompleted: 'Distribution completed',
            distributionMustBe100: 'Distribution must be 100%',

            weightDistribution: 'Category Weight Distribution',
            activeCategoriesTotalWeight:
                'Total weight of active categories',
            distributionReady: 'Weight distribution is ready.',
            distributionMustBe100ForCalculation:
                'The total weight must be 100% for evaluation calculation.',

            noCategory:
                'No categories have been added yet.',
            noCategoryDescription:
                'You can start by creating the first performance category.',

            activeCriteriaCount:
                'active criteria',
            totalCriteriaCount:
                'total criteria',

            editCategory: 'Edit category',
            deleteCategory: 'Delete category',

            categoryCriteriaDescription:
                'Manage the criteria to be evaluated under this category.',
            addCriterion: 'Add Criterion',

            noCriteria:
                'There are no criteria in this category yet.',
            noCriteriaDescription:
                'You can use the “Add Criterion” button above.',

            criteriaDescriptionCount:
                'position descriptions defined',

            editCriterion: 'Edit criterion',
            deleteCriterion: 'Delete criterion',

            inactive: 'Inactive',

            categoryCreated: 'Category created successfully.',
            categoryUpdated: 'Category updated successfully.',
            categoryDeleted: 'Category deleted successfully.',

            criterionCreated: 'Criterion created successfully.',
            criterionUpdated: 'Criterion updated successfully.',
            criterionDeleted: 'Criterion deleted successfully.',

            loadError:
                'An error occurred while loading data.',
            operationError:
                'An error occurred during the operation.',
            categoryDeleteError:
                'Category could not be deleted. It may contain criteria.',
            criterionDeleteError:
                'Criterion could not be deleted.',

            deleteCategoryTitle: 'Delete Category',
            deleteCategoryDescription:
                'Are you sure you want to delete this category? The criteria inside it may be affected.',

            deleteCriterionTitle: 'Delete Criterion',
            deleteCriterionDescription:
                'Are you sure you want to delete this criterion?',
        },

        criteriaForm: {
            createTitle: 'New Criterion',
            editTitle: 'Edit Criterion',
            description:
                'Define the performance criterion to be applied based on job positions.',
            criterionName: 'Criterion Name',
            mainCategory: 'Main Category',
            categoryDescription:
                'The criterion will be created under this category.',
            criterionStatus: 'Criterion Status',
            statusDescription:
                'Manage whether this criterion is used in evaluations.',
            active: 'Active',
            inactive: 'Inactive',
            applicationPositions: 'Applicable Positions',
            applicationPositionsDescription:
                'Select the positions where the criterion will be applied and define an evaluation description for each position.',
            positions: 'Positions',
            selectPosition: 'Select position...',
            descriptionForPosition: 'description',
            cancel: 'Cancel',
            saving: 'Saving...',
            create: 'Create',
            save: 'Save',
        },

        categoryForm: {
            createTitle: 'New Category',
            editTitle: 'Edit Category',

            description:
                'Define the main category and its weight for performance evaluation.',

            categoryName: 'Category Name',
            weight: 'Weight',

            categoryStatus: 'Category Status',

            statusDescription:
                'Inactive categories are not used in new evaluations.',

            active: 'Active',
            inactive: 'Inactive',

            cancel: 'Cancel',
            saving: 'Saving...',
            create: 'Create',
            save: 'Save',
        },

        evaluationPeriods: {
            title: 'Evaluation Periods',
            description:
                'Create and manage the periods in which performance evaluations will be conducted.',

            newPeriod: 'New Period',

            totalPeriods: 'Total Periods',
            active: 'Active',
            upcoming: 'Upcoming',
            completed: 'Completed',

            noPeriods:
                'No evaluation periods have been defined yet.',
            noPeriodsDescription:
                'Create the first period to start the evaluation process.',

            editPeriod: 'Edit period',
            deletePeriod: 'Delete period',

            deleteTitle: 'Delete Period',

            periodCreated: 'Period created successfully.',
            periodUpdated: 'Period updated successfully.',
            periodDeleted: 'Period deleted successfully.',

            loadError:
                'An error occurred while loading periods.',
            operationError:
                'An error occurred during the operation.',
            deleteError:
                'The period could not be deleted because it has evaluations.',
        },

        evaluationPeriodForm: {
            createTitle: 'New Evaluation Period',
            editTitle: 'Edit Period',

            description:
                'Define the name and date range of the evaluation process.',

            periodName: 'Period Name',

            periodNamePlaceholder:
                'e.g. 2026 Year-End Performance Evaluation',

            dateRange: 'Date Range',

            dateRangeDescription:
                'Define the start and end dates during which evaluations can be conducted.',

            startDate: 'Start Date',
            endDate: 'End Date',

            cancel: 'Cancel',
            saving: 'Saving...',
            create: 'Create',
            save: 'Save',
        },

        evaluatorEmployees: {
            title: 'Team Assignments',
            description:
                'Manage the employee teams assigned to evaluators.',

            evaluators: 'evaluators',
            activeEmployees: 'active employees',

            noEvaluators:
                'There are no users with the "Evaluator" role in the system yet. Add one from User Management first.',

            evaluatorsTitle: 'Evaluators',

            evaluatorSearchPlaceholder:
                'Search by name, department or email...',

            noMatchingEvaluators:
                'No evaluators match your search.',

            evaluator: 'Evaluator',
            employee: 'Employee',

            department: 'Department',
            position: 'Position',
            email: 'Email',

            notSpecified: 'Not specified',

            departmentNotSpecified:
                'Department not specified',

            positionNotSpecified:
                'Position not specified',

            positionNone: 'No position',

            employees: 'employees',

            selectEvaluator:
                'Select an evaluator.',

            employeeSearchPlaceholder:
                'Search employee name, email or department...',

            anotherEmployeeSearch:
                'Search for another employee...',

            add: 'Add',

            noTeamMembers:
                'No team members yet',

            noTeamMembersDescription:
                'Select an employee from the field above to assign them to this team.',

            inactive: 'Inactive',

            removeTitle: 'Remove from Team',
            remove: 'Remove',

            usersLoadError:
                'Users could not be loaded.',

            teamLoadError:
                'Team information could not be loaded.',

            employeesAdded:
                '{count} employee(s) added to the team.',

            assignError:
                'An error occurred while adding employees.',

            employeeRemoved:
                'Employee removed from the team.',

            removeError:
                'An error occurred while removing the employee.',
        },

        evaluationDetail: {
            submitted: 'Submitted',
            approved: 'Approved',

            evaluator: 'Evaluator',
            date: 'Date',
            totalScore: 'Total Score',
            comment: 'Comment',

            close: 'Close',
            approve: 'Approve',
            approving: 'Approving...',
        },

        scoreSelector: {
            points: 'points',

            labels: {
                1: 'Insufficient',
                2: 'Needs Improvement',
                3: 'Meets Expectations',
                4: 'Good',
                5: 'Outstanding',
            },
        },

        newEvaluation: {
            title: 'Evaluate My Team',
            description: 'Evaluate employees in your team during the active evaluation period.',
            noTeamMembers: 'No employees in your team',
            noTeamMembersDescription: 'There are no employees assigned to you yet.',
            evaluationPeriod: 'Evaluation Period',
            noEmployees: 'No employees found',
            clear: 'Clear',
            open: 'Open',
            close: 'Close',
            positionNotSpecified: 'Position not specified',
            employee: 'Employee',
            searchEmployee: 'Search employee...',
            completed: 'Completed',
            evaluation: 'Evaluation',
            evaluationProgress: 'Evaluation progress',
            completedCount: 'completed',
            checkingStatus: 'Checking evaluation statuses...',
            noActivePeriod: 'No active evaluation period',
            noActivePeriodDescription: 'An active period is required to create a new evaluation.',
            selectEmployee: 'Select an employee to begin',
            selectEmployeeDescription: 'Performance criteria matching the employee’s position will be displayed here.',
            completedEvaluation: 'Evaluation completed',
            completedForEmployee: 'An evaluation for {name} already exists for the selected period.',
            missingPosition: 'This employee does not have a defined job position. A job position must be assigned to display the criteria.',
            noActiveCriteria: 'There are no active criteria defined for this position.',
            commentOptional: 'Comment (optional)',
            estimatedScore: 'Estimated Total Score',
            allCriteriaRequired: 'You must score all criteria before submitting.',
            submitting: 'Saving...',
            submit: 'Submit Evaluation',
            alreadyEvaluated: 'This employee has already been evaluated for the selected period.',
            success: 'Evaluation saved successfully.',
            saveError: 'An error occurred while saving the evaluation.',
            loadError: 'An error occurred while loading the data.',
            statusLoadError: 'Evaluation statuses could not be retrieved.',
        },

        myEvaluations: {
            title: 'My Performance',
            description: 'Your evaluation history and score progress.',
            noEvaluations: 'You do not have any evaluations yet.',
            scoreProgress: 'Score Progress',
            scoreProgressDescription: 'Track how your performance changes across evaluations.',
            totalScore: 'Total Score',
            historyTitle: 'Evaluation History',
            historyDescription: 'Your previous performance results.',
            searchPlaceholder: 'Search period or evaluator...',
            evaluator: 'Evaluator',
            submitted: 'Submitted',
            approved: 'Approved',
            noSearchResults: 'No evaluation found',
            noSearchResultsDescription: 'Change your search criteria and try again.',
            evaluations: 'evaluations',
        },

        evaluation: {
            title: 'Evaluations',
            description: 'View and review performance evaluations in the system.',
            employee: 'Employee',
            evaluator: 'Evaluator',
            period: 'Evaluation Period',
            periodShort: 'Period',
            totalScore: 'Total Score',
            status: 'Status',
            date: 'Date',
            allPeriods: 'All Periods',
            loadDetailError: 'Details could not be loaded.',
            approveErrorConsole: 'Evaluation could not be approved:',
            approvedCountSuffix: 'evaluation(s) approved.',
            bulkApproveError: 'An error occurred while bulk approving evaluations.',
            viewDetails: 'View details',
            totalEvaluations: 'Total Evaluations',
            filteredRecords: 'Records in the selected filter',
            averageScore: 'Average Score',
            overallAverage: 'Overall evaluation average',
            approved: 'Approved',
            approvalRate: 'approval rate',
            recordsTitle: 'Evaluation Records',
            recordsListed: 'records listed',
            searchPlaceholder: 'Search employee, evaluator or period...',
            approving: 'Approving...',
            approveSelected: 'Approve Selected',
            submitted: 'Submitted',
            gridNoRows: 'No evaluations to display.',
            gridNoResults: 'No results found.',
            gridRowSelected: 'row(s) selected',
            gridTotalRows: 'Total rows:',
            gridColumnMenu: 'Column menu',
            gridShowColumns: 'Show columns',
            gridManageColumns: 'Manage columns',
            gridFilter: 'Filter',
            gridHideColumn: 'Hide column',
            gridUnsort: 'Remove sorting',
            gridSortAsc: 'Sort ascending',
            gridSortDesc: 'Sort descending',
            gridAddFilter: 'Add filter',
            gridDelete: 'Delete',
            gridColumn: 'Column',
            gridValue: 'Value',
            gridFilterValue: 'Filter value',
            gridContains: 'contains',
            gridEquals: 'equals',
            gridStartsWith: 'starts with',
            gridEndsWith: 'ends with',
            gridNotEqual: 'does not equal',
            gridAfter: 'after',
            gridAfterOrEqual: 'after or equal',
            gridBefore: 'before',
            gridBeforeOrEqual: 'before or equal',
            gridEmpty: 'empty',
            gridNotEmpty: 'not empty',
            gridAnyOf: 'is any of',
            gridSortHint: 'Click to sort',
            gridSelect: 'Select',
            gridSelectAll: 'Select all rows',
            gridUnselectAll: 'Unselect all rows',
            gridExport: 'Export',
            gridExportCsv: 'Export as CSV',
            gridPrint: 'Print',
            gridColumns: 'Columns',
            gridFilters: 'Filters',
            gridDensity: 'Row density',
            gridCompact: 'Compact',
            gridStandard: 'Standard',
            gridComfortable: 'Comfortable',
            gridOperator: 'Operator',
            gridLogicOperator: 'Logical operator',
            gridAnd: 'And',
            gridOr: 'Or',
            bulkDialogTitle: 'Approve Evaluations',
            bulkDialogDescription: 'Are you sure you want to approve the selected {count} evaluation(s)? Their status will be changed to Approved.',
            cancel: 'Cancel',
            approve: 'Approve',
        },

        teamRanking: {
            dashboard: 'Dashboard',
            title: 'Team Ranking',
            description: 'Compare team performance for the selected period and review the results.',
            evaluationPeriod: 'Evaluation Period',
            active: 'Active',
            preparing: 'Preparing...',
            excel: 'Excel',
            evaluated: 'EVALUATED',
            employee: 'employees',
            teamAverage: 'TEAM AVERAGE',
            period: 'PERIOD',
            topThree: 'Top 3',
            topThreeDescription: 'Highest scores in the selected period.',
            positionNotSpecified: 'Position not specified',
            performanceRanking: 'Performance Ranking',
            detailedResults: 'Detailed results table.',
            searchPlaceholder: 'Search employee or position...',
            noResults: 'No results found.',
            noResultsDescription: 'No records to display for the selected period or search criteria.',
            rank: 'Rank',
            position: 'Position',
            average: 'Average',
            evaluation: 'Evaluation',
        },

        evaluatorDashboard: {
            welcome: 'Welcome',
            evaluator: 'Evaluator',
            description: 'Analyze your team’s performance and manage the evaluation process from a single screen.',
            evaluationPeriod: 'Evaluation Period',
            active: 'Active',
            notStarted: 'Not Started',
            completed: 'Completed',
            noPeriods: 'No evaluation period yet.',
            noPeriodsDescription: 'Team analysis will appear here when a period is created.',
            progress: 'Evaluation Progress',
            completedSuffix: 'completed',
            teamAverage: 'Team Average',
            evaluatedEmployees: 'Evaluated employees',
            pending: 'Pending',
            pendingEmployees: 'Employees awaiting evaluation',
            performanceRange: 'Performance Range',
            gap: 'Gap',
            points: 'points',
            insufficientData: 'Insufficient data',
            performanceAnalysis: 'Performance Analysis',
            performanceAnalysisDescription: 'Distribution of employee scores in the selected period.',
            results: 'results',
            people: 'people',
            teamScore: 'TEAM SCORE',
            processHealth: 'Process Health',
            processHealthDescription: 'Overall view of the evaluation process.',
            completedUpper: 'COMPLETED',
            status: 'STATUS',
            pendingUpper: 'PENDING',
            topPerformances: 'Top Performances',
            topPerformancesDescription: 'Standout employees on the team.',
            viewAll: 'View All',
            noResults: 'No results for this period yet.',
            analystSummary: 'Analyst Summary',
            analystSummaryDescription: 'Key indicators for this period.',
            rankingView: 'Ranking view',
            trendUp: 'Scores in the upper ranks look strong.',
            trendDown: 'There is a noticeable gap between the scores.',
            trendStable: 'Scores are relatively close to each other.',
            teamSize: 'Team size',
            assignedEmployees: 'assigned employees.',
            priority: 'Priority',
            waitingSuffix: 'evaluation(s) awaiting completion.',
            allCompleted: 'All evaluations are completed.',
            evaluate: 'Evaluate',
            periodInfo: 'Period Information',
        },

        employeeDashboard: {
            welcome: 'Welcome',
            employee: 'Employee',
            description: 'Review your performance and track your progress.',
            myEvaluations: 'My Evaluations',
            noEvaluations: 'No evaluations yet',
            noEvaluationsDescription: 'Your results and performance history will appear here once your performance evaluation is completed.',
            latestResult: 'LATEST PERFORMANCE RESULT',
            excellent: 'Excellent Performance',
            veryGood: 'Very Good Performance',
            good: 'Good Performance',
            developing: 'Room for Improvement',
            needsDevelopment: 'Needs Improvement',
            excellentDescription: 'Your performance is above target. Keep up your successful work.',
            veryGoodDescription: 'Your performance is strong. Keep maintaining your successful results.',
            goodDescription: 'Your performance is at a good level. Focus on development areas to move further forward.',
            developingDescription: 'Focus on the identified development areas to improve your performance.',
            needsDevelopmentDescription: 'Focusing on development areas will help you improve your performance.',
            performanceScore: 'PERFORMANCE SCORE',
            evaluationPeriodUpper: 'EVALUATION PERIOD',
            status: 'Status',
            evaluationCompleted: 'Evaluation completed',
            overallAverage: 'OVERALL AVERAGE',
            evaluation: 'EVALUATION',
            result: 'RESULT',
            performanceTrend: 'Performance Trend',
            performanceTrendDescription: 'Performance change across your recent evaluations.',
            stable: 'Stable',
            risingTrend: 'Rising trend',
            fallingTrend: 'Falling trend',
            firstEvaluation: 'Your first performance evaluation',
            trendFooter: 'Performance change across {count} evaluations',
            results: 'Your Results',
            recentEvaluations: 'Recent evaluations',
            viewAllHistory: 'View Full History',
        },

        adminDashboard: {
            administration: 'Administration',
            heroDescription: 'Monitor performance evaluation processes and organization-wide results from a single dashboard.',
            evaluationPeriod: 'Evaluation Period',
            exporting: 'Exporting...',
            exportExcel: 'Export Excel',
            evaluatedEmployees: 'Evaluated Employees',
            inSelectedPeriod: 'In selected period',
            totalEvaluations: 'Total Evaluations',
            completedEvaluations: 'Completed evaluations',
            overallAverage: 'Overall Average',
            overallPerformanceAverage: 'Overall performance average',
            highestPerformance: 'Highest Performance',
            excellent: 'Excellent',
            veryGood: 'Very Good',
            good: 'Good',
            needsImprovement: 'Needs Improvement',
            critical: 'Critical',
            performanceOverview: 'Performance Overview',
            performanceOverviewDescription: 'Top performing employees in the selected period.',
            viewAll: 'View All',
            noEvaluationData: 'No evaluation data yet',
            noEvaluationDataDescription: 'Results for the selected period will appear here.',
            evaluations: 'evaluations',
            periodSummary: 'Period Summary',
            periodSummaryDescription: 'Overview of the selected evaluation period.',
            overallPerformance: 'Overall Performance',
            startDate: 'Start Date',
            endDate: 'End Date',
            employees: 'Employees',
            detailedReport: 'Detailed Performance Report',
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