const sequelize = require('../../../db/mysqldb/init')
const models = require('../../../db/mysqldb/define')(sequelize)
const { lowdb } = require('../../../db/lowdb/index')
const newAdminAuthorityList = require('./libs/newAdminAuthorityList')
const newUserAuthorityList = require('./libs/newUserAuthorityList')
const CURRENT_VERSION = 0.7
class update {
  static update () {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(`正在升级中，当前版本是${CURRENT_VERSION}....`)
        await models.sequelize.query(
          'rename TABLE dynamic_like to thumb_dynamic;'
        )

        await models.sequelize.query(
          'ALTER TABLE user_message add COLUMN action INTEGER(10) comment "1:系统消息,2:喜欢,3:收藏 ,4:关注 ,5:评论,6:回复,7:赞";'
        )

        await models.sequelize.query(
          'ALTER TABLE user_message add COLUMN sender_id BIGINT(20) comment "发送者ID";'
        )

        await models.sequelize.query(
          'ALTER TABLE article_comment add COLUMN reply_id BIGINT(20) comment "回复评论ID";'
        )

        await models.sequelize.query(
          'ALTER TABLE book_comment add COLUMN reply_id BIGINT(20) comment "回复评论ID";'
        )

        await models.sequelize.query(
          'ALTER TABLE books_comment add COLUMN reply_id BIGINT(20) comment "回复评论ID";'
        )

        await models.sequelize.query(
          'ALTER TABLE dynamic_comment add COLUMN reply_id BIGINT(20) comment "回复评论ID";'
        )

        // 2019.11.3 16:37新增
        await models.sequelize.query(
          'ALTER TABLE user_info add COLUMN shell_total_amount DECIMAL(10,2)  comment "贝壳总额";'
        )

        await models.sequelize.query(
          'ALTER TABLE user_info add COLUMN shell_balance DECIMAL(10,2)  comment "贝壳余额";'
        )

        await models.sequelize.query(
          'ALTER TABLE user_info add COLUMN is_msg_push INTEGER(5) DEFAULT 2 comment "是否开启消息推送 1:开启;2:关闭";'
        )

        // 2019.11.6 11:51
        await models.sequelize.query(
          'ALTER TABLE books add COLUMN is_free tinyint(1) comment "是否免费";'
        )
        await models.sequelize.query(
          'ALTER TABLE books add COLUMN pay_type INTEGER(6) comment "支付类型";'
        )
        await models.sequelize.query(
          'ALTER TABLE books add COLUMN price DECIMAL(8,2) comment "价格";'
        )

        await models.virtual.sync({
          force: true
        })
        await models.order.sync({
          force: true
        })

        // 文章
        await models.article.update(
          {
            status: 4
          },
          {
            where: {
              status: 6
            }
          }
        )

        await models.article_comment.update(
          {
            status: 4
          },
          {
            where: {
              status: 5
            }
          }
        )

        await models.dynamic_comment.update(
          {
            status: 4
          },
          {
            where: {
              status: 5
            }
          }
        )

        let allUser = await models.user.findAll()
        for (let i in allUser) {
          models.user_info.update(
            {
              /* 注册写入数据库操作 */
              shell_balance: 3000
            },
            { uid: allUser[i].uid }
          )

          await models.virtual.create({
            // 用户虚拟币消息记录
            plus_less: 1,
            balance: 3000,
            amount: 3000,
            uid: allUser[i].uid,
            income: 3000,
            expenses: 0,
            type: 8,
            action: 16
          })
        }

        console.log(`${CURRENT_VERSION}版本升级完成`)
        await lowdb
          .get('config')
          .assign({ version: CURRENT_VERSION })
          .write()
        resolve(`${CURRENT_VERSION}版本升级完成`)
      } catch (err) {
        reject(err)
      }
    })
  }
}

module.exports = update