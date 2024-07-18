document.addEventListener('DOMContentLoaded', function() {
    let menuBtn = document.getElementById('menu-btn');
    let sidebar = document.getElementById('sidebar');
    let menuItems = document.getElementById('menu-items');
  
    if (menuBtn && sidebar && menuItems) {
      menuBtn.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        if (sidebar.classList.contains('active')) {
          menuBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
          menuItems.classList.remove('hidden');
          menuItems.classList.add('show');
        } else {
          menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
          menuItems.classList.remove('show');
          menuItems.classList.add('hidden');
        }
      });
  
      let submenuItems = document.querySelectorAll('.sidebar ul li > a');
      submenuItems.forEach(function(item) {
        item.addEventListener('click', function(e) {
          let submenu = this.nextElementSibling;
          if (submenu && submenu.classList.contains('submenu')) {
            e.preventDefault();
            submenu.classList.toggle('hidden');
          }
        });
      });
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    const searchClientLink = document.getElementById('search-client-link');

    if (searchClientLink) {
        searchClientLink.addEventListener('click', (event) => {
            event.preventDefault(); 
            if (window.location.pathname !== '/home') {
                
                window.location.href = '/home?openSearchClient=true';
            } else {

                const searchPopup = document.getElementById('search-popup');
                if (searchPopup) {
                    searchPopup.style.display = 'flex';
                }
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", function() {
  const userMenuContainer = document.querySelector('.logout-container');
  const userMenu = document.querySelector('.user-menu');

  userMenuContainer.addEventListener('click', function() {
      userMenu.style.display = userMenu.style.display === 'block' ? 'none' : 'block';
  });

  window.addEventListener('click', function(event) {
      if (!userMenuContainer.contains(event.target) && !userMenu.contains(event.target)) {
          userMenu.style.display = 'none';
      }
  });
});




  