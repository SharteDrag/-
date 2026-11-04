# -*- coding: utf-8 -*-
# プラグインの設定ファイル（ジョインアベニュー・大量発生）を読み込んで JSON を標準出力に書く。
# build_wiki.py から呼ばれる。ゲーム本体は無いので、読み込みに必要な部分だけ用意する。
require 'json'

ROOT = File.expand_path('..', __dir__)
PLUGINS = File.join(ROOT, 'Plugins')

def _INTL(*args) = args[0]
module GameData
  module TerrainTag; def self.register(*) = nil; end
end
module EventHandlers; def self.add(*) = nil; end
class PokemonGlobalMetadata; end

def load_plugin(path)
  load File.join(PLUGINS, path)
  true
rescue StandardError, ScriptError => e
  warn "#{path}: #{e.class}: #{e.message}"
  false
end

out = {}

if load_plugin('SecretBasesRemade/001_Settings.rb') && load_plugin('SecretBasesRemade/002_Shop_Menus.rb')
  s = ShoppingStreetSettings
  # お店の名前・説明は GameData::StreetShopType.register の中から拾う
  shop_types = {}
  src = File.read(File.join(PLUGINS, 'SecretBasesRemade/[001] Street GameData/002_StreetShopType.rb'), encoding: 'UTF-8')
  src.scan(/StreetShopType\.register\(\{(.*?)\n\}\)/m).each do |(body)|
    id = body[/:id\s*=>\s*:(\w+)/, 1] or next
    shop_types[id] = {
      name: body[/:name\s*=>\s*_INTL\("([^"]*)"/, 1],
      description: body[/:description\s*=>\s*_INTL\("([^"]*)"/, 1],
      slogan: body[/:slogan\s*=>\s*_INTL\("([^"]*)"/, 1]
    }
  end
  out[:avenue] = {
    name: s::DEFAULT_STREET_NAME,
    shop_types: shop_types,
    shop_titles: s::SHOP_TITLES,
    menus: s::SHOP_MENUS,
    staff: s::STAFF_POOL.map { |h| h.slice(:name, :gender, :shop_type, :variant) },
    lottery: {
      prizes: s::LOTTERY_PRIZES,
      weights1: s::LOTTERY_WEIGHTS_RANK1,
      weights10: s::LOTTERY_WEIGHTS_RANK10,
      draws_rank_step: s::LOTTERY_DRAWS_RANK_STEP
    },
    antique: {
      junk: s::ANTIQUE_JUNK,
      appraisal: s::ANTIQUE_APPRAISAL,
      mega: s::ANTIQUE_MEGA_STONES,
      mega_hof: s::ANTIQUE_MEGA_STONES_HOF
    },
    locked: s::LOCKED_ITEMS,
    souvenirs: s::SOUVENIRS,
    souvenir_chance: s::SOUVENIR_CHANCE,
    rank_rewards: (1..s::STREET_MAX_RANK).map { |r| [r, s.street_rank_reward(r)] }.select { |_, v| v },
    nursery: { hatch: s::NURSERY_HATCH, menu: s::NURSERY_MENU, street_rank: s::NURSERY_STREET_RANK,
               hof: s::NURSERY_NEEDS_HALL_OF_FAME },
    hof_rank: s::HOF_ITEMS_STREET_RANK,
    discount: [s::DISCOUNT_PER_RANK, s::DISCOUNT_MAX],
    stat_labels: s::STAT_LABELS
  }
end

if load_plugin('LED Board/002_Outbreak.rb')
  out[:outbreak] = {
    time: Settings::OUTBREAK_TIME,
    chance: Settings::OUTBREAK_CHANCE,
    switch: Settings::OUTBREAK_SWITCH,
    list: Settings::OUTBREAK_SPECIES
  }
end

$stdout.binmode
$stdout.write(JSON.generate(out))
