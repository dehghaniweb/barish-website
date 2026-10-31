/* همه داده‌های این نسخه فقط در مرورگر همین دستگاه ذخیره می‌شوند. */
(() => {
  "use strict";
  const KEY = "barish_frontend_v1";
  const initialProducts = [
    {id:1,name:"گوگرد بنتونیتی",category:"کود و اصلاح خاک",description:"محصول مناسب برنامه‌های تغذیه و اصلاح خاک؛ برای دریافت مشخصات فنی و بسته‌بندی استعلام کنید.",price:"",image:"assets/images/original/sulfur-bentonite.jpg",active:true},
    {id:2,name:"کود آلی",category:"کود و اصلاح خاک",description:"گزینه‌ای برای بهبود ویژگی‌های خاک و پشتیبانی از رشد گیاه؛ مشخصات دقیق پیش از سفارش بررسی شود.",price:"",image:"assets/images/original/organic-fertilizer.jpg",active:true},
    {id:3,name:"کود NPK",category:"کودهای شیمیایی",description:"ترکیب عناصر غذایی پرمصرف برای برنامه تغذیه گیاه؛ نوع و آنالیز متناسب با نیاز انتخاب شود.",price:"",image:"assets/images/original/npk.jpg",active:true},
    {id:4,name:"گوگرد پودری",category:"مواد اولیه",description:"محصول پودری برای مصارف کشاورزی و صنعتی؛ جهت دریافت اطلاعات فنی با کارشناسان تماس بگیرید.",price:"",image:"assets/images/original/sulfur-powder.jpg",active:true}
  ];
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  let db = Object.assign({products:initialProducts,cart:[],orders:[],messages:[],customers:[],staff:[],representatives:[],user:null,settings:{company:"باریش",phone:"",email:"",address:""}},load());
  const save = () => localStorage.setItem(KEY,JSON.stringify(db));
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const fa = n => new Intl.NumberFormat("fa-IR").format(n);
  const esc = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let activeCategory="همه", adminTab="overview";
  function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2600);}
  function persist(){save();renderProducts();updateCartCount();}
  function updateCartCount(){const n=db.cart.reduce((a,x)=>a+x.qty,0);$("#cartCount").textContent=fa(n);if($("#cartCount2"))$("#cartCount2").textContent=fa(n);}
  function categories(){return ["همه",...new Set(db.products.filter(p=>p.active!==false).map(p=>p.category))];}
  function renderFilters(){$("#categoryFilters").innerHTML=categories().map(c=>`<button class="filter-chip ${c===activeCategory?"active":""}" data-category="${esc(c)}">${esc(c)}</button>`).join("");}
  function renderProducts(){
    const q=($("#productSearch")?.value||"").trim().toLowerCase();
    const items=db.products.filter(p=>p.active!==false&&(activeCategory==="همه"||p.category===activeCategory)&&(`${p.name} ${p.description} ${p.category}`).toLowerCase().includes(q));
    $("#productGrid").innerHTML=items.length?items.map(p=>{
      const displayName=String(p.name||"").replace(/باریش/g,"").replace(/\s+/g," ").trim();
      const displayDescription=String(p.description||"").replace(/استعلام(?:‌|\s)*قیمت/g,"").replace(/استعلام کنید/g,"").trim();
      return `<article class="product-card"><div class="product-visual">${p.image?`<img src="${esc(p.image)}" alt="${esc(displayName)}" onerror="this.style.display='none';this.parentElement.innerHTML='<span class=&quot;product-symbol&quot;>✿</span>'">`:'<span class="product-symbol">✿</span>'}</div><div class="product-info"><span class="category-tag">${esc(p.category)}</span><h3>${esc(displayName)}</h3><p>${esc(displayDescription)}</p><div class="product-meta"><span class="product-price">قیمت ویژه: به‌زودی</span></div><div class="product-actions"><button class="btn btn-outline" data-detail="${p.id}">جزئیات</button><button class="btn btn-primary" data-add="${p.id}">اضافه به سبد خرید</button></div></div></article>`;
    }).join(""):'<div class="empty" style="grid-column:1/-1">محصولی با این مشخصات پیدا نشد.</div>';
  }
  function productDetail(id){const p=db.products.find(x=>x.id===id);if(!p)return;modal(esc(p.name),`<div class="detail-layout"><div class="detail-image">${p.image?`<img src="${esc(p.image)}" style="width:100%;height:230px;object-fit:cover;border-radius:12px" onerror="this.remove()">`:"✿"}</div><div><span class="category-tag">${esc(p.category)}</span><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><b>${esc(p.price||"")}</b><p class="muted">برای دریافت قیمت نهایی و اطلاعات فنی، درخواست خود را ثبت کنید.</p><button class="btn btn-primary" data-add="${p.id}">اضافه به سبد خرید</button></div></div>`);}
  function addCart(id){const p=db.products.find(x=>x.id===id);if(!p)return;const item=db.cart.find(x=>x.productId===id);if(item)item.qty++;else db.cart.push({productId:id,qty:1});save();updateCartCount();toast("محصول به درخواست شما اضافه شد.");}
  function viewCart(){const rows=db.cart.map(x=>{const p=db.products.find(y=>y.id===x.productId);return p?`<tr><td>${esc(p.name)}</td><td><input style="width:75px" type="number" min="1" value="${x.qty}" data-qty="${p.id}"></td><td><button class="btn danger" data-remove="${p.id}">حذف</button></td></tr>`:"";}).join("");modal("سبد خرید",rows?`<div class="table-wrap"><table><thead><tr><th>محصول</th><th>تعداد</th><th>عملیات</th></tr></thead><tbody>${rows}</tbody></table></div><div class="modal-actions"><button class="btn btn-primary" data-checkout>ثبت سفارش</button><button class="btn btn-outline" data-clearcart>خالی کردن سبد</button></div><p class="muted">این ثبت سفارش آزمایشی است و پرداخت آنلاین انجام نمی‌شود.</p>`:'<div class="empty">هنوز محصولی به سبد درخواست اضافه نکرده‌اید.</div>',true);}
  function checkout(){if(!db.cart.length)return;const order={id:Date.now(),date:new Date().toLocaleString("fa-IR"),customer:db.user?.name||"مشتری مهمان",phone:db.user?.phone||"",items:db.cart.map(x=>({...x})),status:"در انتظار بررسی"};db.orders.unshift(order);db.cart=[];save();updateCartCount();closeModal();toast("سفارش آزمایشی شما ثبت شد.");}
  function login(){modal("ورود / ثبت‌نام مشتری",`<form id="loginForm" class="form-grid"><div class="form-field"><label>نام و نام خانوادگی</label><input name="name" required></div><div class="form-field"><label>شماره تماس</label><input name="phone" required></div><div class="form-field full"><label>ایمیل (اختیاری)</label><input name="email" type="email"></div><div class="form-field full"><button class="btn btn-primary">ورود نمایشی</button></div></form><p class="muted">در این نسخه رمز عبور و احراز هویت واقعی فعال نیست.</p>`,true);}
  function account(){if(!db.user){login();return;}modal("حساب کاربری",`<p><b>${esc(db.user.name)}</b></p><p>شماره تماس: ${esc(db.user.phone)}</p><p>ایمیل: ${esc(db.user.email||"ثبت نشده")}</p><div class="modal-actions"><button class="btn btn-outline" data-view="orders">سفارش‌های من</button><button class="btn danger" data-logout>خروج</button></div>`,true);}
  function ordersView(){const rows=db.orders.filter(o=>!db.user||o.phone===db.user.phone||o.customer===db.user.name).map(o=>`<tr><td>${fa(o.id).slice(-7)}</td><td>${esc(o.date)}</td><td>${o.items.reduce((n,x)=>n+x.qty,0)}</td><td><span class="status">${esc(o.status)}</span></td></tr>`).join("");modal("سوابق سفارش‌ها",rows?`<div class="table-wrap"><table><thead><tr><th>کد</th><th>تاریخ</th><th>تعداد</th><th>وضعیت</th></tr></thead><tbody>${rows}</tbody></table></div>`:'<div class="empty">سفارشی برای نمایش وجود ندارد.</div>');}
  function letters(){modal("صندوق مکاتبات",`<form id="messageForm" class="form-grid"><div class="form-field"><label>نام</label><input name="name" value="${esc(db.user?.name||"")}" required></div><div class="form-field"><label>شماره تماس</label><input name="phone" value="${esc(db.user?.phone||"")}" required></div><div class="form-field full"><label>موضوع</label><input name="subject" required></div><div class="form-field full"><label>متن پیام</label><textarea name="message" rows="4" required></textarea></div><div class="form-field full"><button class="btn btn-primary">ثبت پیام</button></div></form><p class="muted">پیام در همین مرورگر ذخیره می‌شود و به سرور ارسال نمی‌شود.</p>`,true);}
  const adminTabs=[["overview","نمای کلی"],["products","مدیریت محصولات"],["orders","مدیریت سفارش‌ها"],["customers","مشتریان"],["messages","مکاتبات"],["staff","کارکنان"],["reps","نمایندگان"],["reports","گزارش‌ها"],["settings","تنظیمات"]];
  function admin(){adminTab="overview";renderAdmin();}
  function renderAdmin(){
    const nav=adminTabs.map(([k,t])=>`<button class="${adminTab===k?"active":""}" data-admin-tab="${k}">${t}</button>`).join("");
    let body="";
    if(adminTab==="overview")body=`<div class="admin-cards"><div class="metric"><b>${fa(db.products.length)}</b><small>محصول ثبت‌شده</small></div><div class="metric"><b>${fa(db.orders.length)}</b><small>درخواست خرید</small></div><div class="metric"><b>${fa(db.customers.length)}</b><small>مشتری ثبت‌شده</small></div><div class="metric"><b>${fa(db.messages.length)}</b><small>پیام دریافتی</small></div></div><h3>آخرین درخواست‌ها</h3>${ordersTable(db.orders.slice(0,5))}`;
    if(adminTab==="products")body=`<div class="toolbar"><button class="btn btn-primary" data-add-product>افزودن محصول جدید</button><input id="adminSearch" placeholder="جستجوی محصول..."></div>${productsTable()}`;
    if(adminTab==="orders")body=ordersTable(db.orders,true);
    if(adminTab==="customers")body=customersTable();
    if(adminTab==="messages")body=messagesTable();
    if(adminTab==="staff")body=`<div class="toolbar"><button class="btn btn-primary" data-add-person="staff">افزودن کارمند</button></div>${peopleTable(db.staff,"staff")}`;
    if(adminTab==="reps")body=`<div class="toolbar"><button class="btn btn-primary" data-add-person="representatives">افزودن نماینده</button></div>${peopleTable(db.representatives,"representatives")}`;
    if(adminTab==="reports")body=`<h3>گزارش عملکرد</h3><div class="admin-cards"><div class="metric"><b>${fa(db.orders.length)}</b><small>کل سفارش‌ها</small></div><div class="metric"><b>${fa(db.orders.filter(o=>o.status==="تأیید شده").length)}</b><small>سفارش تأییدشده</small></div><div class="metric"><b>${fa(db.messages.length)}</b><small>کل پیام‌ها</small></div><div class="metric"><b>${fa(db.products.filter(p=>p.active!==false).length)}</b><small>محصول فعال</small></div></div><button class="btn btn-primary" data-export>دریافت گزارش CSV</button>`;
    if(adminTab==="settings")body=`<form id="settingsForm" class="form-grid"><div class="form-field"><label>نام مجموعه</label><input name="company" value="${esc(db.settings.company)}"></div><div class="form-field"><label>شماره تماس</label><input name="phone" value="${esc(db.settings.phone)}"></div><div class="form-field"><label>ایمیل</label><input name="email" value="${esc(db.settings.email)}"></div><div class="form-field full"><label>نشانی</label><textarea name="address">${esc(db.settings.address)}</textarea></div><div class="form-field full"><button class="btn btn-primary">ذخیره تنظیمات</button></div></form><p class="muted">تنظیمات فقط در حافظه مرورگر ذخیره می‌شوند.</p>`;
    modal("پنل مدیریت باریش",`<div class="admin-layout"><aside class="admin-side">${nav}</aside><div class="admin-main">${body}</div></div>`);
  }
  function productsTable(){return `<div class="table-wrap"><table><thead><tr><th>نام محصول</th><th>دسته</th><th>قیمت</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>${db.products.map(p=>`<tr data-product-row="${p.id}"><td>${esc(p.name)}</td><td>${esc(p.category)}</td><td>${esc(p.price)}</td><td>${p.active===false?"غیرفعال":"فعال"}</td><td><button class="btn btn-outline" data-edit-product="${p.id}">ویرایش</button> <button class="btn danger" data-delete-product="${p.id}">حذف</button></td></tr>`).join("")}</tbody></table></div>`;}
  function ordersTable(list,manage=false){if(!list.length)return '<div class="empty">درخواستی ثبت نشده است.</div>';return `<div class="table-wrap"><table><thead><tr><th>کد</th><th>مشتری</th><th>تماس</th><th>تاریخ</th><th>وضعیت</th>${manage?"<th>عملیات</th>":""}</tr></thead><tbody>${list.map(o=>`<tr><td>${fa(o.id).slice(-7)}</td><td>${esc(o.customer)}</td><td>${esc(o.phone)}</td><td>${esc(o.date)}</td><td><span class="status">${esc(o.status)}</span></td>${manage?`<td><select data-order-status="${o.id}">${["در انتظار بررسی","در حال پیگیری","تأیید شده","رد شده","ارسال شده"].map(s=>`<option ${o.status===s?"selected":""}>${s}</option>`).join("")}</select></td>`:""}</tr>`).join("")}</tbody></table></div>`;}
  function customersTable(){const list=[...db.customers,...db.orders.filter(o=>o.phone).map(o=>({name:o.customer,phone:o.phone}))];const unique=[...new Map(list.map(x=>[x.phone,x])).values()];return unique.length?`<div class="table-wrap"><table><thead><tr><th>نام مشتری</th><th>شماره تماس</th></tr></thead><tbody>${unique.map(c=>`<tr><td>${esc(c.name)}</td><td>${esc(c.phone)}</td></tr>`).join("")}</tbody></table></div>`:'<div class="empty">هنوز مشتری ثبت نشده است.</div>';}
  function messagesTable(){return db.messages.length?`<div class="table-wrap"><table><thead><tr><th>نام</th><th>تماس</th><th>موضوع</th><th>پیام</th><th>تاریخ</th></tr></thead><tbody>${db.messages.map(m=>`<tr><td>${esc(m.name)}</td><td>${esc(m.phone)}</td><td>${esc(m.subject)}</td><td>${esc(m.message)}</td><td>${esc(m.date)}</td></tr>`).join("")}</tbody></table></div>`:'<div class="empty">پیامی ثبت نشده است.</div>';}
  function peopleTable(list,key){return list.length?`<div class="table-wrap"><table><thead><tr><th>نام</th><th>سمت / منطقه</th><th>تماس</th><th>عملیات</th></tr></thead><tbody>${list.map((p,i)=>`<tr><td>${esc(p.name)}</td><td>${esc(p.role)}</td><td>${esc(p.phone)}</td><td><button class="btn danger" data-person-delete="${key}:${i}">حذف</button></td></tr>`).join("")}</tbody></table></div>`:'<div class="empty">موردی ثبت نشده است.</div>';}
  function productForm(id){const p=id?db.products.find(x=>x.id===id):{};modal(id?"ویرایش محصول":"افزودن محصول",`<form id="productForm" class="form-grid"><input type="hidden" name="id" value="${p.id||""}"><div class="form-field"><label>نام محصول</label><input name="name" value="${esc(p.name||"")}" required></div><div class="form-field"><label>دسته‌بندی</label><input name="category" value="${esc(p.category||"")}" required></div><div class="form-field"><label>قیمت / عبارت قیمت</label><input name="price" value="${esc(p.price||"")}"></div><div class="form-field"><label>مسیر تصویر</label><input name="image" value="${esc(p.image||"")}" placeholder="assets/images/..."></div><div class="form-field full"><label>توضیحات</label><textarea name="description" rows="3">${esc(p.description||"")}</textarea></div><div class="form-field"><label>وضعیت</label><select name="active"><option value="true" ${p.active===false?"":"selected"}>فعال</option><option value="false" ${p.active===false?"selected":""}>غیرفعال</option></select></div><div class="form-field full"><button class="btn btn-primary">ذخیره محصول</button></div></form>`);}
  function personForm(key){const title=key==="staff"?"کارمند":"نماینده";modal("افزودن "+title,`<form id="personForm" class="form-grid"><input type="hidden" name="kind" value="${key}"><div class="form-field"><label>نام و نام خانوادگی</label><input name="name" required></div><div class="form-field"><label>شماره تماس</label><input name="phone"></div><div class="form-field full"><label>سمت / منطقه فعالیت</label><input name="role"></div><div class="form-field full"><button class="btn btn-primary">ثبت اطلاعات</button></div></form>`,true);}
  function exportCSV(){const rows=[["کد سفارش","مشتری","شماره تماس","تاریخ","وضعیت"],...db.orders.map(o=>[o.id,o.customer,o.phone,o.date,o.status])];const csv="\\uFEFF"+rows.map(r=>r.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(",")).join("\\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));a.download="barish-orders.csv";a.click();URL.revokeObjectURL(a.href);}
  document.addEventListener("click",e=>{
    const t=e.target.closest("button,a");if(!t)return;
    if(t.id==="menuToggle")$("#mainNav").classList.toggle("open");
    if(t.dataset.category){activeCategory=t.dataset.category;renderProducts();}
    if(t.dataset.add){addCart(Number(t.dataset.add));}
    if(t.dataset.detail)productDetail(Number(t.dataset.detail));
    if(t.dataset.view){const v=t.dataset.view;({cart:viewCart,account,orders:ordersView,letters,admin,login}[v]||(()=>{}))();}
    if(t.hasAttribute("data-close")||e.target.hasAttribute("data-backdrop"))closeModal();
    if(t.dataset.remove){db.cart=db.cart.filter(x=>x.productId!==Number(t.dataset.remove));save();updateCartCount();viewCart();}
    if(t.hasAttribute("data-clearcart")){db.cart=[];save();updateCartCount();viewCart();}
    if(t.hasAttribute("data-checkout"))checkout();
    if(t.dataset.logout){db.user=null;save();closeModal();toast("از حساب نمایشی خارج شدید.");}
    if(t.dataset.adminTab){adminTab=t.dataset.adminTab;renderAdmin();}
    if(t.hasAttribute("data-add-product"))productForm();
    if(t.dataset.editProduct)productForm(Number(t.dataset.editProduct));
    if(t.dataset.deleteProduct){if(confirm("این محصول حذف شود؟")){db.products=db.products.filter(p=>p.id!==Number(t.dataset.deleteProduct));save();renderAdmin();renderProducts();}}
    if(t.dataset.addPerson)personForm(t.dataset.addPerson);
    if(t.dataset.personDelete){const [k,i]=t.dataset.personDelete.split(":");db[k].splice(Number(i),1);save();renderAdmin();}
    if(t.hasAttribute("data-export"))exportCSV();
  });
  document.addEventListener("change",e=>{
    if(e.target.dataset.qty){const x=db.cart.find(i=>i.productId===Number(e.target.dataset.qty));if(x)x.qty=Math.max(1,Number(e.target.value)||1);save();updateCartCount();}
    if(e.target.dataset.orderStatus){const o=db.orders.find(x=>x.id===Number(e.target.dataset.orderStatus));if(o){o.status=e.target.value;save();toast("وضعیت سفارش ذخیره شد.");}}
  });
  document.addEventListener("input",e=>{
    if(e.target.id==="productSearch")renderProducts();
    if(e.target.id==="adminSearch")$$("[data-product-row]").forEach(r=>r.style.display=r.textContent.includes(e.target.value)?"":"none");
  });
  document.addEventListener("submit",e=>{
    e.preventDefault();const f=e.target,d=Object.fromEntries(new FormData(f).entries());
    if(f.id==="loginForm"){db.user={name:d.name,phone:d.phone,email:d.email};db.customers.push({name:d.name,phone:d.phone});save();closeModal();toast("ورود نمایشی انجام شد.");}
    if(f.id==="messageForm"){db.messages.unshift({...d,date:new Date().toLocaleString("fa-IR")});save();closeModal();toast("پیام در مرورگر ثبت شد.");}
    if(f.id==="productForm"){const item={id:d.id?Number(d.id):Date.now(),name:d.name,category:d.category,price:d.price, image:d.image,description:d.description,active:d.active==="true"};const i=db.products.findIndex(p=>p.id===item.id);if(i>=0)db.products[i]=item;else db.products.push(item);save();closeModal();renderProducts();toast("اطلاعات محصول ذخیره شد.");}
    if(f.id==="personForm"){const k=d.kind;db[k].push({name:d.name,phone:d.phone,role:d.role});save();closeModal();renderAdmin();toast("اطلاعات ثبت شد.");}
    if(f.id==="settingsForm"){db.settings={company:d.company,phone:d.phone,email:d.email,address:d.address};save();toast("تنظیمات ذخیره شد.");}
    if(f.id==="contactForm"){db.messages.unshift({name:d.name,phone:d.phone,subject:"پیام از صفحه تماس",message:d.message,date:new Date().toLocaleString("fa-IR")});save();f.reset();toast("پیام شما در مرورگر ثبت شد.");}
  });
  renderProducts();updateCartCount();
})();