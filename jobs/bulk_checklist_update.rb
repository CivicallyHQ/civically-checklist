module Jobs
  class BulkChecklistUpdate < Jobs::Base
    def execute(args)
      users = User.where(id: args['user_ids'])
      users.each do |user|
        if args['checked']
          CivicallyChecklist::Checklist.toggle_checked(user, args['checked']['id'], args['checked']['state'])
        end
        if args['active']
          CivicallyChecklist::Checklist.toggle_active(user, args['active']['id'], args['active']['state'])
        end
      end
    end
  end
end
