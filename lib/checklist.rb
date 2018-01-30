class CivicallyChecklist::Checklist
  def self.get_list(user)
    ::JSON.parse(PluginStore.get('action_checklist', user.id))
  end

  def self.set_list(user, list)
    PluginStore.set('action_checklist', user.id, ::JSON.generate(list))
  end

  def self.add_item(user, item, index = nil)
    list = get_list(user)

    unless list.include?(item)
      if index
        list.insert(index, item)
      else
        list.push(item)
      end

      set_list(user, list)
    end
  end

  def self.update_item(user, item_id, updates)
    list = get_list(user)

    list.each do |item|
      if item['id'] === item_id
        updates.each do |k, v|
          item[k.to_s] = v
        end
      end
    end

    set_list(user, list)
  end
end
