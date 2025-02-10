import Link from 'next/link'
import { Section } from '../../components/layout/Section'

export default function Privacy() {
  return (
    <Section>
      <h1 className="py-6 text-center sm:py-11">プライバシーポリシー</h1>
      <p>本サービスは、利用者の個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます。）を定めます。</p>
      <h2 className="pb-2 pt-6 sm:pt-9 sm:text-xl">第1条（個人情報）</h2>
      <p>「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、当該情報に含まれる氏名・生年月日・住所・電話番号・連絡先その他の記述等により特定の個人を識別できる情報及び容貌・指紋・声紋にかかるデータ、及び健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報（個人識別情報）を指します。</p>
      <h2 className="pb-2 pt-6 sm:pt-9 sm:text-xl">第2条（個人情報の収集方法）</h2>
      <p>本サービスは、利用者が利用登録をする際に氏名・生年月日・住所・電話番号・メールアドレス・銀行口座番号・クレジットカード番号・運転免許証番号などの個人情報をお尋ねすることがあります。また、利用者と提携先などとの間でなされた利用者の個人情報を含む取引記録や決済に関する情報を、運営者の提携先（情報提供元・広告主・広告配信先などを含みます。以下｢提携先｣といいます。）などから収集することがあります。</p>
      <h2 className="pb-2 pt-6 sm:pt-9 sm:text-xl">第3条（個人情報を収集・利用する目的）</h2>
      <p>運営者が個人情報を収集・利用する目的は、以下のとおりです。</p>
      <ol className="list-decimal pl-5 text-sm sm:pl-6 sm:text-base">
        <li className="my-2">
          運営者サービスの提供・運営のため

        </li>
        <li className="my-2">利用者からのお問い合わせに回答するため（本人確認を行うことを含む）</li>
        <li className="my-2">利用者が利用中のサービスの新機能・更新情報・キャンペーン等及び運営者が提供する他のサービスの案内のメールを送付するため</li>
        <li className="my-2">メンテナンス、重要なお知らせなど必要に応じたご連絡のため</li>
        <li className="my-2">利用規約に違反した利用者や不正・不当な目的でサービスを利用しようとする利用者の特定をし、ご利用をお断りするため</li>
        <li className="my-2">利用者にご自身の登録情報の閲覧や変更・削除・ご利用状況の閲覧を行っていただくため</li>
        <li className="my-2">有料サービスにおいて、利用者に利用料金を請求するため</li>
        <li className="my-2">上記の利用目的に付随する目的</li>
      </ol>
      <h2 className="pb-2 pt-6 sm:pt-9 sm:text-xl">第4条（利用目的の変更）</h2>
      <ol className="list-decimal pl-5 text-sm sm:pl-6 sm:text-base">
        <li className="my-2">本サービスは、利用目的が変更前と関連性を有すると合理的に認められる場合に限り、個人情報の利用目的を変更するものとします。</li>
        <li className="my-2">
          利用目的の変更を行った場合には、変更後の目的について、運営者所定の方法により、利用者に通知し、または本ウェブサイト上に公表するものとします。
        </li>
      </ol>
      <h2 className="pb-2 pt-6 sm:pt-9 sm:text-xl">第5条（個人情報の第三者提供）</h2>
      <ol className="list-decimal pl-5 text-sm sm:pl-6 sm:text-base">
        <li className="my-2">
          本サービスは次に掲げる場合を除いて、あらかじめ利用者の同意を得ることなく、第三者に個人情報を提供することはありません。ただし、個人情報保護法その他の法令で認められる場合を除きます。
          <ol className="ml-5 list-[lower-alpha] text-sm sm:text-base">
            <li className="my-2">人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
            <li className="my-2">公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
            <li className="my-2">国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
            <li className="my-2">
              予め次の事項を告知あるいは公表し、かつ運営者が個人情報保護委員会に届出をしたとき
              <ol className="ml-5 list-[lower-roman] text-sm sm:text-base">
                <li className="my-2">利用目的に第三者への提供を含むこと</li>
                <li className="my-2">第三者に提供されるデータの項目</li>
                <li className="my-2">第三者への提供の手段または方法</li>
                <li className="my-2">本人の求めに応じて個人情報の第三者への提供を停止すること</li>
                <li className="my-2">本人の求めを受け付ける方法</li>
              </ol>
            </li>
          </ol>
        </li>
        <li className="my-2">
          前項の定めにかかわらず、次に掲げる場合には、当該情報の提供先は第三者に該当しないものとします。
          <ol className="ml-5 list-[lower-alpha] text-sm sm:text-base">
            <li className="my-2">本サービスが利用目的の達成に必要な範囲内において個人情報の取扱いの全部または一部を委託する場合</li>
            <li className="my-2">合併その他の事由による事業の承継に伴って個人情報が提供される場合</li>
            <li className="my-2">個人情報を特定の者との間で共同して利用する場合であって、その旨並びに共同して利用される個人情報の項目、共同して利用する者の範囲、利用する者の利用目的および当該個人情報の管理について責任を有する者の氏名または名称について、あらかじめ本人に通知し、または本人が容易に知り得る状態に置いた場合</li>
          </ol>
        </li>
      </ol>
      <h2 className="pb-2 pt-6 sm:pt-9 sm:text-xl">第6条（個人情報の開示）</h2>
      <ol className="list-decimal pl-5 text-sm sm:pl-6 sm:text-base">
        <li className="my-2">
          本サービスは、本人から個人情報の開示を求められたときは、本人に対し、遅滞なくこれを開示します。ただし開示することにより次のいずれかに該当する場合は、その全部または一部を開示しないこともあり、開示しない決定をした場合には、その旨を遅滞なく通知します。なお、個人情報の開示に際しては、1件あたり1、000円の手数料を申し受けます。
          <ol className="ml-5 list-[lower-alpha] text-sm sm:text-base">
            <li className="my-2">本人または第三者の生命・身体・財産その他の権利利益を害するおそれがある場合</li>
            <li className="my-2">運営者の業務の適正な実施に著しい支障を及ぼすおそれがある場合</li>
            <li className="my-2">その他法令に違反することとなる場合</li>
          </ol>
        </li>
        <li className="my-2">前項の定めにかかわらず、履歴情報および特性情報などの個人情報以外の情報については、原則として開示いたしません。</li>
      </ol>
      <h2 className="pb-2 pt-6 sm:pt-9 sm:text-xl">第2条（利用登録）</h2>
      <ol className="list-decimal pl-5 text-sm sm:pl-6 sm:text-base">
        <li className="my-2">本サービスにおいては、登録希望者が本規約に同意の上、運営者の定める方法によって利用登録を申請し、運営者がこれを承認することによって、利用登録が完了するものとします。</li>
        <li className="my-2">
          運営者は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあり、その理由については一切の開示義務を負わないものとします。
          <ol className="ml-5 list-[lower-alpha] text-sm sm:text-base">
            <li className="my-2">利用登録の申請に際して虚偽の事項を届け出た場合</li>
            <li className="my-2">本規約に違反したことがある者からの申請である場合</li>
            <li className="my-2">その他、運営者が利用登録を相当でないと判断した場合</li>
          </ol>
        </li>
      </ol>
      <h2 className="pb-2 pt-6 sm:pt-9 sm:text-xl">第7条（個人情報の訂正および削除）</h2>
      <ol className="list-decimal pl-5 text-sm sm:pl-6 sm:text-base">
        <li className="my-2">利用者は、本サービスが保有する自己の個人情報が誤った情報である場合には、本サービスが定める手続きにより、本サービスに対して個人情報の訂正、追加または削除（以下「訂正等」といいます。）を請求することができます。</li>
        <li className="my-2">本サービスは、利用者から前項の請求を受けてその請求に応じる必要があると判断した場合には、遅滞なく、当該個人情報の訂正等を行うものとします。</li>
        <li className="my-2">本サービスは、前項の規定に基づき訂正等を行った場合、または訂正等を行わない旨の決定をしたときは遅滞なく、これを利用者に通知します。</li>
      </ol>
      <h2 className="pb-2 pt-6 sm:pt-9 sm:text-xl">第8条（個人情報の利用停止等）</h2>
      <ol className="list-decimal pl-5 text-sm sm:pl-6 sm:text-base">
        <li className="my-2">本サービスは、本人から、個人情報が、利用目的の範囲を超えて取り扱われているという理由、または不正の手段により取得されたものであるという理由により、その利用の停止または消去（以下「利用停止等」といいます。）を求められた場合には、遅滞なく必要な調査を行います。</li>
        <li className="my-2">前項の調査結果に基づき、その請求に応じる必要があると判断した場合には、遅滞なく、当該個人情報の利用停止等を行います。</li>
        <li className="my-2">本サービスは、前項の規定に基づき利用停止等を行った場合、または利用停止等を行わない旨の決定をしたときは、遅滞なく、これを利用者に通知します。</li>
        <li className="my-2">

          前2項にかかわらず、利用停止等に多額の費用を有する場合その他利用停止等を行うことが困難な場合であって、利用者の権利利益を保護するために必要なこれに代わるべき措置をとれる場合は、この代替策を講じるものとします。
        </li>
      </ol>
      <h2 className="pb-2 pt-6 sm:pt-9 sm:text-xl">第9条（プライバシーポリシーの変更）</h2>
      <ol className="list-decimal pl-5 text-sm sm:pl-6 sm:text-base">
        <li className="my-2">本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、利用者に通知することなく、変更することができるものとします。</li>
        <li className="my-2">
          運営者が別途定める場合を除いて、変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。
        </li>
      </ol>
      <h2 className="pb-2 pt-6 sm:pt-9 sm:text-xl">第10条（お問い合わせ窓口）</h2>
      <p>
        本ポリシーに関するお問い合わせは、
        <Link href="https://forms.gle/K2vM7erf5y8eo8Nr9" className="pr-1 text-primary hover:underline">お問い合わせフォーム</Link>
        からお願いいたします。
      </p>

    </Section>
  )
}
