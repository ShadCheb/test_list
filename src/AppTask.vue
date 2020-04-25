<template>
  <section class="task" id="app-task">
    <article class="task__settings">
      <div class="task__settings__row">
        <p>Отображать:</p>
        <div class="task__settings__list">
          <label class="label" 
            v-for="(column, key, idx) in columns"
            :key="'col-' + idx"
          >
            <input type="checkbox" name="columns" :value="key" 
              v-model="showColumn"
            />
            <span @click="onSelectViewColumn(key, $event)">{{ columns[key] }}</span>
          </label>
        </div>
      </div>
      <div class="task__settings__row">
        <p>Сортировка:</p>
        <div class="task__settings__list">
          <label class="label" 
            v-for="(column, key, idx) in columns"
            :key="'col-' + idx"
            @click="onSelectSort(key)"
          >
            <input type="radio" name="sort" :value="key" 
              :checked="showColumn[0] == key" />
            <span>{{ column }}</span>
          </label>
        </div>
      </div>
      <div class="task__settings__row">
        <p>Сортировка по:</p>
        <div class="task__settings__list">
          <label class="label" @click="onSelectFilter('asc')">
            <input type="radio" name="filter" value="asc" checked />
            <span>Возрастанию</span>
          </label>
          <label class="label" @click="onSelectFilter('desc')">
            <input type="radio" name="filter" value="desc" />
            <span>Убыванию</span>
          </label>
        </div>
      </div>
      <div class="task__settings__row">
        <p>Количество:</p>
        <div class="task__settings__list">
          <label class="label"
            v-for="(count, idx) in countProductsList"
            :key="idx"
            @click="onSelectCount(count)"
          >
            <input type="radio" name="count" :value="count" 
              :checked="countProducts == count ? true : false" />
            <span>{{ count }}</span>
          </label>
        </div>
      </div>
    </article>

    <table class="task__table">
      <thead>
        <tr>
          <th
            v-for="(column, idx) in showColumn"
            :key="idx"
          >{{ columns[column] }}</th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="(product, idx) in sortedProducts"
          :key="product.id"
          @click="onSelectProduct(product.id)"
          :class="[selectList.indexOf(product.id) > -1 ? 'select' : '']"
        >
          <td
            v-for="column in showColumn"
            :key="column + '-' + idx"
          >{{ product[column] }}</td>
        </tr>
      </tbody>
    </table>

    <article class="task__btns">
      <button class="btn" :disabled="selectList | isDisabled"
        @click="onDeleteProducts"
      >Удалить выбранные</button>
    </article>

    <div class="message__bcg" v-if="deleteMessage" @click="toggleDeleteMessage">
      <article class="message" @click.stop="">
        <p>Вы точно хотите удалить продукт?</p>
        <div class="message__btns">
          <button class="btn">Да</button>
          <button class="btn" @click="toggleDeleteMessage">Нет</button>
        </div>
      </article>
    </div>

    <div class="message__bcg" v-if="errorMessage" @click="closeErrorMessage">
      <article class="message" @click.stop="">
        <p>Проиошла ошибка, попробуйте обновить страницу</p>
      </article>
    </div>

    <div class="load" v-if="load">Загрузка</div>

  </section>
</template>

<script>
import {getProducts, deleteProducts} from './assets/request';
import {store} from './store';

export default {
  name: 'Task',
  store,
  data() {
    return {
      columns: { 
        calories: 'Калории', 
        carbs: 'Углеводы',
        fat: 'Жиры',
        iron: 'Железо',
        product: 'Продукт',
        protein: 'Белок'
      },
      showColumn: [],
      countProductsList: [10, 15, 20],

      selectList: [],

      filterType: '',
      sortedProducts: [],
      countProducts: 0,

      errorMessage: false,
      deleteMessage: false,

      load: false
    };
  },
  filters: {
    isDisabled(value) {
      return value.length ? false : true;
    }
  },
  async created() {
    const firstColumn = 'product';

    this.filterType = 'asc';
    this.countProducts = this.countProductsList[0];

    for (let column in this.columns) {
      this.showColumn.push(column);
    }
    this.$nextTick(() => this.selectSort(firstColumn));

    try {
      this.load = true;

      let products = await getProducts();

      this.$store.dispatch('setProdcts', products);
      this.filterData();

      this.load = false;
    } catch(e) {
      console.error(e);
      console.error('Произошла ошибка на сервере, подождите устраняем 8( !!!!');

      this.showErrorMessage();
      this.load = false;
    }
  },
  methods: {
    async onDeleteProducts() {
      try {
        this.load = true;

        let result = await deleteProducts();

        if (result.message) {
          let products = this.$store.getters.getProducts;
          let deleted = this.selectList;

          products = products.filter(product => {
            return (deleted.indexOf(product.id) > -1) ? false : true;
          });

          this.$store.dispatch('setProdcts', products);
          this.filterData();
        }

        this.selectList = [];
        this.load = false;
      } catch(e) {
        console.error(e);
        console.error('Произошла ошибка на сервере, подождите устраняем 8( !!!!');

        this.showErrorMessage();
        this.selectList = [];
        this.load = false;
      }
    },
    filterData() {
      let products = this.$store.getters.getProducts;

      if (!products.length)
        return;

      let nameSortedColmn = this.showColumn[0];
      let sortedProducts = [];
      let typeSort = 1;
      let typeData = typeof products[0][nameSortedColmn];

      
      // Функция сортировки
      if (this.filterType == 'asc') {
        typeSort = 1;
      } else if (this.filterType == 'desc') {
        typeSort = -1;
      } else {
        console.error('Не известный тип сортировки');

        return;
      }

      if (typeData == 'string') {
        sortedProducts = products.sort((a, b) => {
          let itemA = a[nameSortedColmn].toLowerCase();
          let itemB = b[nameSortedColmn].toLowerCase();

          if (itemA < itemB)
            return -1 * typeSort;
          else if (itemA > itemB)
            return 1 * typeSort;
          else 
            return 0;
        });
      } else if (typeData == 'number') {
        sortedProducts = products.sort((a, b) => {
          return (a[nameSortedColmn] - b[nameSortedColmn]) * typeSort;
        });
      } else {
        console.error('Не известный тип данных для сортировки');

        return;
      }
      
      this.$store.dispatch('setProdcts', sortedProducts);
      this.sortedProducts = sortedProducts.slice(0, this.countProducts);
    },


    showErrorMessage() {
      this.errorMessage = true;

      setTimeout(() => { this.errorMessage = false; }, 2000);
    },
    closeErrorMessage() {
      this.errorMessage = false;
    },
    toggleDeleteMessage() {
      this.deleteMessage = !this.deleteMessage;
    },

    onSelectProduct(idx) {
      let index = this.selectList.indexOf(idx);
      
      if (index > -1) 
        this.selectList = this.selectList.filter(select => select != idx);
      else 
        this.selectList.push(idx);
    },
    onSelectCount(count) {
      let products = this.$store.getters.getProducts;

      this.countProducts = count;
      this.sortedProducts = products.slice(0, this.countProducts);
    },
    onSelectFilter(type) {
      this.filterType = type;

      this.filterData();
    },
    onSelectSort(brief) {
      this.selectSort(brief);
      this.filterData();
    },
    selectSort(brief) {
      let newShowColumn = [];

      newShowColumn.push(brief);
      this.showColumn.map(column => {
        if (column != brief)
          newShowColumn.push(column);
      });
      this.showColumn = newShowColumn;
    },
    onSelectViewColumn(brief, e) {
      if (this.showColumn.length < 2){
        e.preventDefault();

        return;
      }
      if (brief == this.showColumn[0])
        this.onSelectSort(this.showColumn[1]);
    },
  }
}
</script>

<style>
  @import "./AppTask.css";
</style>
