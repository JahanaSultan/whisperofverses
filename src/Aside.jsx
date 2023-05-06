import React from 'react'

const Aside = () => {
  return (
    <aside>
        <h2>Təqvim</h2>
        <div class="today">
          <div class="hijri">
            <h3>Hicri</h3>
          </div>
          <div id="clock"></div>
          <div class="gregorian">
            <h3>Miladi</h3>
          </div>
        </div>
        <div class="prayer-sticky">
          <h2>Namaz Vaxtları</h2>
          <div class="prayer-date">
            <h4 id="location"></h4>
          </div>
        </div>
      </aside>
  )
}

export default Aside