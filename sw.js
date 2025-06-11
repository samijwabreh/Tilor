// Service Worker لبرنامج إدارة مشغل الخياطة
// يتيح العمل بدون إنترنت في أي مكان

const CACHE_NAME = 'tailor-shop-standalone-v2.0.0';
const urlsToCache = [
  './',
  './index.html',
  './تطبيق_يعمل_100%.html',
  './تطبيق_مشغل_الخياطة.html',
  './css/style.css',
  './js/app.js',
  './js/data.js',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// تثبيت Service Worker
self.addEventListener('install', function(event) {
  console.log('🔧 تثبيت Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('📦 حفظ الملفات في الذاكرة المؤقتة...');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        console.log('✅ تم تثبيت Service Worker بنجاح');
        return self.skipWaiting();
      })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', function(event) {
  console.log('🚀 تفعيل Service Worker...');
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ حذف ذاكرة مؤقتة قديمة:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log('✅ تم تفعيل Service Worker بنجاح');
      return self.clients.claim();
    })
  );
});

// اعتراض الطلبات والاستجابة من الذاكرة المؤقتة
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // إذا وُجد في الذاكرة المؤقتة، أرجعه
        if (response) {
          return response;
        }

        // إذا لم يوجد، حاول جلبه من الشبكة
        return fetch(event.request).then(function(response) {
          // تحقق من صحة الاستجابة
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // انسخ الاستجابة
          var responseToCache = response.clone();

          // احفظها في الذاكرة المؤقتة
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(function() {
          // إذا فشل الطلب (لا يوجد إنترنت)
          console.log('📱 وضع عدم الاتصال');
          
          if (event.request.destination === 'document') {
            return caches.match('./تطبيق_يعمل_100%.html') || caches.match('./index.html');
          }
        });
      })
  );
});

console.log('📱 Service Worker جاهز للعمل بدون إنترنت!');
