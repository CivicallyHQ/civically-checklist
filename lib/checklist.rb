class CivicallyChecklist::Checklist
  def self.user_list(user)
    ::JSON.parse(PluginStore.get('action_checklist', user.id))
  end

  def self.set_list(user, list)
    PluginStore.set('action_checklist', user.id, ::JSON.generate(list))
  end

  def self.add_item(user, item, index = nil)
    list = user_list(user)

    unless list.include?(item)
      if index
        list.insert(index, item)
      else
        list.push(item)
      end

      set_list(user, list)
    end
  end

  def self.toggle_checked(user, item_id, checked)
    list = user_list(user)

    list.each do |item|
      if item['id'] === item_id
        item['checked'] = checked
      end
    end

    set_list(user, list)
  end

  def self.toggle_active(user, item_id, active)
    list = user_list(user)

    list.each do |item|
      if item['id'] === item_id
        item['active'] = active
      end
    end

    set_list(user, list)
  end
end
